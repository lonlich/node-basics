
const message: string = "Hello TypeScript!";
console.log(message);

interface User {
  name: string;
}

function getUserName(user: User): string {
  return user.name.toUpperCase();
}

const response = { username: "Alex" };
// ❌ Error: Property 'name' is missing in type '{ username: string; }' but required in type 'User'

function multiply(a: number, b: number): number {
  return a * b;
}

// ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
console.log(multiply(10, "2"));

