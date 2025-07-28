var message = "Hello TypeScript!";
console.log(message);
function getUserName(user) {
    return user.name.toUpperCase();
}
var response = { username: "Alex" };
// ❌ Error: Property 'name' is missing in type '{ username: string; }' but required in type 'User'
function multiply(a, b) {
    return a * b;
}
// ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
console.log(multiply(10, "2"));
