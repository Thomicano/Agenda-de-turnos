"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestSupabase() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function test() {
      const res = await supabase.from("negocios").select("*");
      console.log("SUPABASE RESULT:", res);

      setData(res.data || []);
      setError(res.error);
    }

    test();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Supabase</h1>

      {error && (
        <pre style={{ color: "red" }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
