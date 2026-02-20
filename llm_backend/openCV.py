from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from ultralytics import YOLO
import base64
import time

app = Flask(__name__)
CORS(app)

# ---------------- CONFIG ----------------
LEFT_RIGHT_TOLERANCE = 0.12   # increase = more relaxed
UP_DOWN_TOLERANCE = 0.15
LOOK_AWAY_TIME = 1.0
PHONE_CHECK_INTERVAL = 0.1
# ----------------------------------------

print("Loading YOLO...")
model = YOLO("yolov8n.pt")
print("YOLO loaded")

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades +
                                      'haarcascade_frontalface_default.xml')

LOOK_START = None
last_phone_check = 0
cached_phone = False
cached_people = 1


def base64_to_img(data):
    img_bytes = base64.b64decode(data)
    img_array = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(img_array, cv2.IMREAD_COLOR)


def detect_focus(frame):
    global LOOK_START

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.2, 5)

    if len(faces) == 0:
        return {"is_focused": False, "reason": "no_face"}

    # largest face
    x, y, w, h = max(faces, key=lambda f: f[2]*f[3])

    face_center_x = x + w/2
    face_center_y = y + h/2

    # assume nose approx center of face lower
    nose_x = x + w/2
    nose_y = y + h*0.55

    dx = (nose_x - face_center_x) / w
    dy = (nose_y - face_center_y) / h

    looking = None

    if dx > LEFT_RIGHT_TOLERANCE:
        looking = "right"
    elif dx < -LEFT_RIGHT_TOLERANCE:
        looking = "left"
    elif dy > UP_DOWN_TOLERANCE:
        looking = "down"
    elif dy < -UP_DOWN_TOLERANCE:
        looking = "up"

    if looking:
        if LOOK_START is None:
            LOOK_START = time.time()

        if time.time() - LOOK_START > LOOK_AWAY_TIME:
            return {"is_focused": False, "reason": looking}
        else:
            return {"is_focused": True, "reason": "checking"}
    else:
        LOOK_START = None
        return {"is_focused": True, "reason": "focused"}


@app.route("/analyze", methods=["POST"])
def analyze():
    global last_phone_check, cached_phone, cached_people

    body = request.json
    frame = base64_to_img(body["frame"])

    head = detect_focus(frame)

    now = time.time()
    if now - last_phone_check > PHONE_CHECK_INTERVAL:
        small = cv2.resize(frame, (320, 240))
        r = model.predict(small, verbose=False, imgsz=320, conf=0.5)[0]

        phone = False
        people = 0

        for b in r.boxes:
            cls = int(b.cls[0])
            name = model.names[cls]
            if name == "cell phone":
                phone = True
            elif name == "person":
                people += 1

        cached_phone = phone
        cached_people = people
        last_phone_check = now

    return jsonify({
        "is_focused": head["is_focused"],
        "phone_detected": cached_phone,
        "people_count": cached_people,
        "analysis": head
    })


if __name__ == "__main__":
    app.run(port=5001, threaded=True)