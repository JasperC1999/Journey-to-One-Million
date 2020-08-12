export const animateCounter = (start: number, end: number, duration: number, setter: React.Dispatch<React.SetStateAction<number>>): void => {
  const range = end - start;
  const startTime = new Date() as unknown as number;
  const timer = setInterval(() => {
    const timePassed = new Date() as unknown as number - startTime;
    let progress = timePassed / duration;
    if (progress > 1) progress = 1;
    setter(start + Math.round(progress * range));
    if (progress === 1) {
      clearInterval(timer);
    }
  }, 10);
}

export const numberToCommaSeperatedString = (x: number): (string | number) => {
  if (x < 999) return x.toString();
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}