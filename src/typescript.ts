// Функция, складывающая два числа и возвращающая число
function sum(a: number, b: number): number {
  return a + b;
}

const result = sum(5, 10); // Всё правильно, result будет 15

const wrongResult = sum("5", 10);