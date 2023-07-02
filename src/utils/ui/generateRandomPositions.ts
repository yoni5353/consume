const MAX_ATTEMPTS = 15;
const COLLISION_THRESHOLD = 10; // ChatGPT suggestion default

type Position = { x: number; y: number };

export function generateRandomSquarePositions({
  amount,
  containerWidth,
  containerHeight,
  size,
}: {
  amount: number;
  containerWidth: number;
  containerHeight: number;
  size: number;
}) {
  const positions: { x: number; y: number }[] = [];

  function getRandomPosition(attempts = 0): { x: number; y: number } {
    const newPosition = {
      x: Math.random() * (containerWidth - size),
      y: Math.random() * (containerHeight - size),
    };

    if (attempts > MAX_ATTEMPTS) {
      return newPosition;
    }

    const isOverlapping = positions?.some((position) =>
      checkCollision(position, newPosition, size)
    );

    return isOverlapping ? getRandomPosition(attempts + 1) : newPosition;
  }

  for (let i = 0; i < amount; i++) {
    positions.push(getRandomPosition());
  }
  return positions;
}

function checkCollision(position1: Position, position2: Position, size: number) {
  const distance = Math.sqrt(
    Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2)
  );

  return distance < COLLISION_THRESHOLD + size * 2;
}
