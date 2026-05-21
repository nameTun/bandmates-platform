export function generateRandomUser() {
  const timestamp = new Date().getTime();
  return {
    displayName: `QA Auto ${timestamp}`,
    email: `qa_${timestamp}@automation.com`,
    password: 'Password123!'
  };
}
