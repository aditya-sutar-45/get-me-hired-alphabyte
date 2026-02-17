import { BACKEND_BASE_URL } from "../constants";

export const getJobs = async () => {
  const response = await fetch(`${BACKEND_BASE_URL}/jobs`);
  return await response.json();
};

export const getJobsByCompany = async () => {
  const response = await fetch(`${BACKEND_BASE_URL}/company/jobs`, {
    credentials: "include",
  })
  const data = await response.json();
  return data
}

export const getJobByID = async (jobID) => {
  const response = await fetch(`${BACKEND_BASE_URL}/jobs/${jobID}`);
  return await response.json();
};


export const getUserByUsername = async (username) => {
  const response = await fetch(`${BACKEND_BASE_URL}/users/${username}`);
  return await response.json();
};

export const executeCode = async (language, sourceCode) => {
  // execute code
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: language, // e.g. "python", "javascript", "c"
      version: "*", // "*" means latest available version
      files: [
        {
          name: "main." + getExtension(language),
          content: sourceCode,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Failed to execute code");
  }

  const result = await response.json();
  return result;
};

const getExtension = (language) => {
  const map = {
    javascript: "js",
    python: "py",
    go: "c",
    java: "java",
  };
  return map[language] || "txt";
};

export const createInterviewSession = async (jobID) => {
  const res = await fetch(`${BACKEND_BASE_URL}/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_id: jobID
    }),
    credentials: "include",
  });

  if (res.status !== 201) {
    console.log(res)
    throw new Error("interview session is not created")
  }

  return res
}

export const updateInterviewSession = async (sessionID, payload) => {
  const res = await fetch(`${BACKEND_BASE_URL}/interview/${sessionID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text(); // important for debugging
    console.error("Update failed:", errorText);
    throw new Error("Interview session not updated");
  }

  return await res.json();
};
