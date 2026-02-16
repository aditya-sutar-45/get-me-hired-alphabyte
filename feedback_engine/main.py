from dotenv import load_dotenv
from flask import Flask, jsonify, request
from engine.generate_hints import generate_hint
from engine.generate_feedback import user_feedback
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/user_feedback", methods=["POST"])
def generate_user_feedback():
    try:
        data = request.json

        question = data.get("question")
        user_answer = data.get("user_answer")

        if not question:
            return jsonify({"error": "Question is required"}), 400
        if not user_answer:
            return jsonify({"error": "user answer is required"}), 400

        feedback = user_feedback(question=question, user_answer=user_answer)
        if not feedback:
            return jsonify({"error": "Failed to generate hint"}), 500

        response = {
            "user_answer": user_answer,
            "logical_correctness": feedback.get("logical_correctness"),
            "feedback": feedback.get("feedback"),
            "logical_score": feedback.get("logical_score"),
            "confidence": feedback.get("confidence"),
        }
        print(response)

        return jsonify(response)

    except Exception as e:
        print("ERROR:", e)

        return jsonify({"error": "Internal server error"}), 500


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

        # generate hint
        hints = generate_hint(question, context)
        if not hints:
            return jsonify({"error": "Failed to generate hint"}), 500

        response = {
            "question": question,
            "topic": hints.get("topic"),
            "hints": hints.get("hints"),
        }

        print(response)

        return jsonify(response)

    except Exception as e:
        print("ERROR:", e)

        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(host="localhost", port=6969, debug=True)
