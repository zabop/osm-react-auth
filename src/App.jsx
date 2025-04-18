import React, { useState, useEffect } from "react";

const auth = window.osmAuth.osmAuth({
  client_id: "Wir5rj5vBQYnzvu62Si2GimI-MMf8OuRMlqvmNiSQGk",
  scope: "read_prefs",
  redirect_uri: `${window.location.origin}/osm-react-auth/land.html`,
  singlepage: false,
});

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Function to fetch user details using the auth.xhr method provided by osmAuth
  function fetchUserDetails() {
    auth.xhr({ method: "GET", path: "/api/0.6/user/details" }, (err, res) => {
      if (err) {
        setError("Failed to fetch user details");
        return;
      }

      const userEl = res.getElementsByTagName("user")[0];
      const changesets = res.getElementsByTagName("changesets")[0];

      setUser({
        name: userEl.getAttribute("display_name"),
        id: userEl.getAttribute("id"),
        count: changesets.getAttribute("count"),
      });
      setError("");
    });
  }

  // Process auth on component mount if the URL has the authorization code.
  useEffect(() => {
    if (
      window.location.search.includes("code=") &&
      !auth.authenticated() &&
      !user &&
      !error
    ) {
      auth.authenticate(() => {
        // Remove the auth code from the URL for a cleaner history entry.
        window.history.pushState({}, null, window.location.pathname);
        fetchUserDetails();
      });
    }
  }, []); // Run on mount only

  function handleLogin() {
    auth.authenticate(() => fetchUserDetails());
  }

  function handleLogout() {
    auth.logout();
    setUser(null);
    setError("");
  }

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>

      {error && <> {error} </>}

      {user && <> Authenticated: {user.name} </>}
    </div>
  );
}
