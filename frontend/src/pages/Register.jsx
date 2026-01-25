import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("student"); // student | company

  // Student Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resume, setResume] = useState(null);

  // Company Fields
  const [companyUsername, setCompanyUsername] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");

  const { register, registerAsCompany, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    try {
      if (role === "student") {
        await register(username, email, password, resume);
        navigate(`/profile/${username}`);
      } else {
        await registerAsCompany(companyUsername, companyEmail, companyPassword, companyName, companyWebsite, companyDescription); // backend should detect company
        navigate(`/profile/${companyUsername}`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="w-dvw h-screen flex justify-center items-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-2/5 border p-4">
        <legend className="fieldset-legend w-full text-lg font-space-mono">
          Register
        </legend>

        {/* ✅ ROLE TOGGLE BUTTONS */}
        <div className="flex gap-2 mb-4">
          <button
            className={`btn w-1/2 ${role === "student" ? "btn-neutral" : "btn-outline"
              }`}
            onClick={() => setRole("student")}
            type="button"
          >
            Student
          </button>
          <button
            className={`btn w-1/2 ${role === "company" ? "btn-neutral" : "btn-outline"
              }`}
            onClick={() => setRole("company")}
            type="button"
          >
            Company
          </button>
        </div>

        {/* ================= STUDENT FORM ================= */}
        {role === "student" && (
          <>
            <label className="label w-full">Username</label>
            <input
              type="text"
              value={username}
              className="input w-full"
              placeholder="your username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <label className="label w-full">Email</label>
            <input
              type="email"
              value={email}
              className="input w-full"
              placeholder="someone@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="label w-full">Password</label>
            <input
              type="password"
              className="input w-full"
              value={password}
              placeholder="your password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <fieldset className="fieldset mt-0">
              <legend className="fieldset-legend">Upload Resume</legend>
              <input
                type="file"
                className="file-input w-full"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
              />
              <label className="label">format: pdf</label>
            </fieldset>
          </>
        )}

        {/* ================= COMPANY FORM ================= */}
        {role === "company" && (
          <>
            <label className="label w-full">Username</label>
            <input
              type="text"
              className="input w-full"
              placeholder="company username"
              onChange={(e) => setCompanyUsername(e.target.value)}
            />

            <label className="label w-full">Email</label>
            <input
              type="email"
              className="input w-full"
              placeholder="company email"
              onChange={(e) => setCompanyEmail(e.target.value)}
            />

            <label className="label w-full">Password</label>
            <input
              type="password"
              className="input w-full"
              placeholder="password"
              onChange={(e) => setCompanyPassword(e.target.value)}
            />

            <label className="label w-full">Company Name</label>
            <input
              type="text"
              className="input w-full"
              placeholder="company name"
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <label className="label w-full">Company Website</label>
            <input
              type="text"
              className="input w-full"
              placeholder="https://example.com"
              onChange={(e) => setCompanyWebsite(e.target.value)}
            />

            <label className="label w-full">Company Description</label>
            <textarea
              className="textarea w-full"
              placeholder="describe your company"
              onChange={(e) => setCompanyDescription(e.target.value)}
            />
          </>
        )}

        {/* ✅ COMMON SUBMIT BUTTON */}
        <button
          disabled={loading}
          className="btn btn-neutral w-full mt-4"
          onClick={submit}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Register"
          )}
        </button>
      </fieldset>
    </div>
  );
}

export default Register;
