import { useBundleBuilder } from "./hooks/useBundleBuilder";
import { BundleBuilder } from "./components/BundleBuilder/BundleBuilder";
import { ReviewPanel } from "./components/ReviewPanel/ReviewPanel";
import styles from "./App.module.css";

export default function App() {
  const api = useBundleBuilder();

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <h1 className={styles.pageTitle}>Let&apos;s get started!</h1>
      </header>

      <main className={styles.layout}>
        <section className={styles.left} aria-label="Bundle builder">
          <BundleBuilder api={api} />
        </section>
        <section className={styles.right}>
          <ReviewPanel api={api} />
        </section>
      </main>
    </div>
  );
}
