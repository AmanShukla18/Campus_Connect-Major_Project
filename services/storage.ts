// Lightweight storage helper: returns a simple object with a `url` field.
// This avoids requiring firebase at runtime. Replace with a real upload
// implementation once you wire Firebase Storage or another provider.
export async function uploadProfileImage(uri: string, path = 'profile') {
  // If you later wire Firebase, replace this implementation with an upload
  // using the Firebase Storage SDK and return the download URL.
  return { url: uri };
}
