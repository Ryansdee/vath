"use client";

import { useState } from "react";

export default function TestPortalPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createTestPortal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/portal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: "Test User",
          clientEmail: "test@example.com",
          projectName: "Test Project",
          expiresInDays: 30,
          files: [
            {
              id: "1",
              url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
              name: "test-photo.jpg",
              type: "image",
              size: 2500000
            }
          ]
        }),
      });
      
      const data = await response.json();
      setResult(data);
      console.log('Result:', data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Portal Creation</h1>
        
        <button
          onClick={createTestPortal}
          disabled={loading}
          className="px-6 py-3 bg-black text-white disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Test Portal"}
        </button>

        {result && (
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}