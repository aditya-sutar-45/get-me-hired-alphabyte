import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";


function JobKnowledgeBase() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search value synced with URL
  const searchQuery = searchParams.get("search") || "";

  // Fetch KB docs
  async function fetchDocs() {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/kb/${id}${searchQuery ? `?search=${searchQuery}` : ""}`
      );

      const data = await res.json();
      setDocs(data || []);
      console.log(data)
    } catch (err) {
      console.error("Error fetching KB:", err);
    } finally {
      setLoading(false);
    }
  }

  // Run when kbID or search changes
  useEffect(() => {
    fetchDocs();
  }, [id, searchQuery]);

  // Handle search submit
  function handleSearch(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const q = form.get("search");

    setSearchParams(
      q ? { search: q } : {}   // clears ?search when empty
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-base-200 min-h-screen">

      {/* Header */}
      <h1 className="text-3xl font-bold text-primary mb-4">
        Knowledge Base: {id}
      </h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          name="search"
          defaultValue={searchQuery}
          placeholder="Search documents..."
          className="input input-bordered w-full"
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center opacity-70">Loading...</div>
      ) : docs.length === 0 ? (
        <div className="text-center opacity-70">No documents found</div>
      ) : (
        <div className="grid gap-4">
          {docs.map((doc, i) => (
            <div key={i} className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">
                  {doc.metadata?.title || `Document ${i + 1}`}
                </h2>

                <p className="text-xs opacity-60 mb-2">
                  Source: {doc.metadata?.source || "unknown"}
                </p>

                <pre className="bg-base-200 p-3 rounded text-sm whitespace-pre-wrap">
                  {doc.content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default JobKnowledgeBase;
