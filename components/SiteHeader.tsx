import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="bar">
      <div className="wrap">
        <Link href="/" aria-label="AZ#97, accueil">
          <img src="/img/logo-black.png" alt="AZ#97" width={815} height={253} />
        </Link>
        <nav aria-label="Navigation principale">
          <Link className="opt" href="/#collections">Collections</Link>
          <Link className="opt" href="/#coloris">Coloris</Link>
          <Link className="pill" href="/#collections">Précommander</Link>
        </nav>
      </div>
    </header>
  );
}
