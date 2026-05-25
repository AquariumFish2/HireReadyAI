import { User } from "./models/user";
import { useUser } from "./context/userContext";
import { USER_ROLE } from "./utils/enums";

function App() {
  const { user, profile, loading, signUpUser, signInUser, signOutUser } = useUser();

  const handleSignUp = async () => {
    try {
      const email = "mohamed@gmail.com";
      const password = "12345678";
      const userProfile = new User("Mohamed Mabrouk", USER_ROLE.recruiter, "01013767382", true);
      
      console.log("Signing up...");
      await signUpUser(email, password, userProfile);
      console.log("Sign up & profile creation successful!");
    } catch (err) {
      console.error("Sign up error:", err.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const email = "mohamed@gmail.com";
      const password = "12345678";
      
      console.log("Signing in...");
      await signInUser(email, password);
      console.log("Sign in successful!");
    } catch (err) {
      console.error("Sign in error:", err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      await signOutUser();
      console.log("Sign out successful!");
    } catch (err) {
      console.error("Sign out error:", err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px", fontFamily: "sans-serif" }}>Loading user session...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Supabase Auth & Context Test</h1>
      
      {user ? (
        <div style={{ background: "#f0fdf4", padding: "15px", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "15px" }}>
          <h3>Welcome, {profile?.full_name || user.email}!</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {profile?.role}</p>
          <p><strong>Phone:</strong> {profile?.phone}</p>
          <p><strong>Active:</strong> {profile?.is_active ? "Yes" : "No"}</p>
          <button onClick={handleSignOut} style={{ padding: "8px 16px", cursor: "pointer", background: "#ef4444", color: "white", border: "none", borderRadius: "4px" }}>
            Sign Out
          </button>
        </div>
      ) : (
        <div style={{ background: "#fef2f2", padding: "15px", borderRadius: "8px", border: "1px solid #fecaca", marginBottom: "15px" }}>
          <p>You are not logged in.</p>
          <button onClick={handleSignUp} style={{ padding: "8px 16px", cursor: "pointer", marginRight: "10px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px" }}>
            Sign Up
          </button>
          <button onClick={handleSignIn} style={{ padding: "8px 16px", cursor: "pointer", background: "#10b981", color: "white", border: "none", borderRadius: "4px" }}>
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

