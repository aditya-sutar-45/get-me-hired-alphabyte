import { Link, useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";

function LoginModal() {
  const navigate = useNavigate();

  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn"
        onClick={() => document.getElementById("my_modal_2").showModal()}
      >
        Login
      </button>
      <dialog id="my_modal_2" className="modal">
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
        <div className="modal-box">
          <LoginForm />
          <form method="dialog">
            <button
              className="cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Not registered? click here.
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}

export default LoginModal;
