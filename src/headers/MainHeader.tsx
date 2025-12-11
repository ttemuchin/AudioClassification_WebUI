import styles from "./MainHeader.module.css";

function MainHeader() {
  return (
    <>
      <header className={styles.backcover}>
        <div className={styles.header}>
          <div className={styles.leftColumn}>
            <a href="#" className={styles.titleLink}>
              <h1 className={styles.title}>HEADER</h1>
              <h2 className={styles.subtitle}>header</h2>
            </a>
            <hr />
          </div>
          <div className={styles.verticalDivider}></div>
          <div className={styles.rightColumn}>
            <div className={styles.field}>
              <div className={styles.topLinks}>
                <a href="#">a1</a>
                <a href="#">a2</a>
                <a href="#">a3</a>
                <a href="#">a4</a>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
export default MainHeader;
