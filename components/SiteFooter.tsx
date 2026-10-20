export default function SiteFooter() {
  return (
    <footer className="site-foot wrap">
      <img src="/img/logo-black.png" alt="AZ#97" width={815} height={253} />
      <p className="caps" style={{ fontSize: ".7rem" }}>Quatre coloris. Une signature.</p>
      <p>© {new Date().getFullYear()} AZ#97</p>
    </footer>
  );
}
