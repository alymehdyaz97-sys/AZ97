export function SparkDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="spark" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" />
      </symbol>
    </svg>
  );
}

export function Spark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <use href="#spark" />
    </svg>
  );
}
