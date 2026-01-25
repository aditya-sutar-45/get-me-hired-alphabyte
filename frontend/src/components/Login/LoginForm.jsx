import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, authError } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <>
      {authError && <span className="text-red-600">{authError}</span>}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
        <legend className="fieldset-legend w-full">Login</legend>

        <label className="label w-full">Username</label>
        <input
          type="text"
          value={username}
          className="input w-full"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          placeholder="your username..."
        />

        <label className="label w-full">Password</label>
        <input
          type="password"
          value={password}
          className="input w-full"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="your password..."
        />
        <form>
          <button
            className="btn btn-neutral w-full"
            disabled={loading}
            onClick={(e) => submit(e)}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </fieldset>
    </>
  );
}

export default LoginForm;
