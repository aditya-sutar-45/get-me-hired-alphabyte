from dotenv import load_dotenv
from flask import Flask, json, jsonify, request
from engine.generate_hints import generate_hint
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/generate_hint", methods=["POST"])
def generate_hint_route():
    try:
        data = request.json

        question = data.get("question")
        context = data.get("context")

        if not question:
            return jsonify({"error": "Question is required"}), 400
        if not context:
            return jsonify({"error": "Context is required"}), 400

        print("hit api")

        # generate hint
        # hints = generate_hint(question, context)
        # if not hints:
        # return jsonify({"error": "Failed to generate hint"}), 500

        return jsonify({"done": "hints hints"})

    except Exception as e:
        print("ERROR:", e)

        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(host="localhost", port=6969, debug=True)
