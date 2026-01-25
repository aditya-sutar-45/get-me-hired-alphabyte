import { useState } from "react";
import { BACKEND_BASE_URL } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function CreateJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customInterview, setCustomInterview] = useState(false);
  const [customLanguage, setCustomLanguage] = useState("");
  const [customLanguages, setCustomeLanguages] = useState([]);
  const [kbFile, setKbFile] = useState(null);

  const languages = ["JavaScript", "Python", "Go", "Java"];
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((item) => item !== lang)
        : [...prev, lang]
    );
  };

  async function submitJob() {
    const formData = new FormData();

    const params = {
      company_name: user.company_name,
      title,
      description,
      custom_interview: customInterview,
      languages: customInterview ? customLanguages : selectedLanguages,
    };

    formData.append("params", JSON.stringify(params));

    if (customInterview && kbFile) {
      formData.append("knowledge_base", kbFile);
    }

    const res = await fetch(`${BACKEND_BASE_URL}/jobs`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) return console.error(await res.text());

    navigate("/job");
  }

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-base-200 border border-base-300 rounded-xl p-8 shadow-md">

        <h1 className="text-3xl font-bold mb-6">Create New Job</h1>

        {/* Job Title */}
        <div className="form-control mb-4">
          <label className="label font-medium">Job Title</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="AI Systems Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Job Description */}
        <div className="form-control mb-4">
          <label className="label font-medium">Job Description</label>
          <textarea
            className="textarea textarea-bordered h-32 w-full"
            placeholder="Describe the responsibilities and expectations..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Custom Interview Toggle */}
        <div className="flex items-center gap-3 my-4">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={customInterview}
            onChange={() => setCustomInterview((prev) => !prev)}
          />
          <span className="font-medium">Custom Interview</span>
        </div>

        {/* Custom Interview Section */}
        {customInterview ? (
          <div className="mt-4 p-4 rounded-lg bg-base-100 space-y-4">

            {/* Upload KB */}
            <div>
              <label className="label font-medium">Upload Knowledge Base</label>
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                onChange={(e) => setKbFile(e.target.files[0])}
              />
            </div>

            {/* Add Custom Languages */}
            <div>
              <label className="label font-medium">Add Required Skills</label>
              <div className="join w-full">
                <input
                  type="text"
                  className="input input-bordered join-item w-full"
                  placeholder="MongoDB, Rust, Solidity..."
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                />
                <button
                  className="btn join-item"
                  onClick={() => {
                    if (customLanguage.trim() !== "")
                      setCustomeLanguages((p) => [...p, customLanguage]);

                    setCustomLanguage("");
                  }}
                >
                  Add
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {customLanguages.length === 0 && (
                  <p className="text-gray-500">No languages added</p>
                )}
                {customLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="badge badge-primary gap-2 py-3 px-4 text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Auto-select Languages Section */
          <div className="mt-4 p-4 rounded-lg bg-base-100">
            <label className="label font-medium">Select Required Skills</label>

            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  className={`px-4 py-2 rounded-full border transition ${selectedLanguages.includes(lang)
                    ? "bg-primary text-white border-primary"
                    : "bg-base-200 border-base-300"
                    }`}
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <h3 className="mt-3 font-medium">Selected:</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedLanguages.length === 0 && (
                <p className="text-gray-500">No languages selected</p>
              )}
              {selectedLanguages.map((lang) => (
                <span
                  key={lang}
                  className="badge badge-primary py-3 px-4 text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn-primary w-full mt-6"
          onClick={submitJob}
        >
          Create Job
        </button>
      </div>
    </div>
  );
}

export default CreateJob;

