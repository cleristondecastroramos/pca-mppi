import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify authentication - extract JWT from authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create client with user's JWT to verify authentication
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const userClient = createClient(url, anonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify user has administrator role using the has_role function
    const supabaseAdmin = createClient(url, serviceKey);
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "administrador",
    });

    if (roleError) {
      console.error("Role check failed:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Failed to verify user permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!hasAdminRole) {
      console.warn(`User ${user.id} attempted bucket operation without admin role`);
      return new Response(
        JSON.stringify({ error: "Forbidden - administrator role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // User is authenticated and has admin role - proceed with bucket operation
    const { bucket, public: isPublic } = await req.json();
    if (!bucket || typeof bucket !== "string") {
      return new Response(JSON.stringify({ error: "bucket is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate bucket name (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(bucket)) {
      return new Response(
        JSON.stringify({ error: "Invalid bucket name - use only letters, numbers, hyphens, and underscores" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Admin ${user.id} creating/updating bucket: ${bucket}`);

    const list = await supabaseAdmin.storage.listBuckets();
    const exists = (list.data || []).some((b: any) => b.name === bucket);
    if (!exists) {
      const { error: createErr } = await supabaseAdmin.storage.createBucket(bucket, {
        public: isPublic ?? true,
      });
      if (createErr) {
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (isPublic === false) {
      await supabaseAdmin.storage.updateBucket(bucket, { public: false });
    } else {
      await supabaseAdmin.storage.updateBucket(bucket, { public: true });
    }

    return new Response(JSON.stringify({ ok: true, bucket }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Bucket operation error:", e?.message || String(e));
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
