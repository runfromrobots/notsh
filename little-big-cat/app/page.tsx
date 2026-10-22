import Art, { CatMark } from '@/components/Art'
import NotifyForm from '@/components/NotifyForm'
import { ARTIST_NAME, NAME_CANDIDATES, releases } from '@/lib/project'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.topbar}>
        <span className={styles.mark}>
          <CatMark />
          <span>{ARTIST_NAME ?? 'Little Big Cat'}</span>
        </span>
        <span>New music · coming soon</span>
      </header>

      <section className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>The debut album</p>
          <h1 className={styles.title}>
            <span className={styles.titleLittle}>little</span>
            <span className={styles.titleBig}>Big</span>
            <span className={styles.titleCat}>Cat</span>
          </h1>
          <p className={styles.lede}>
            An album on the way, with an EP called <em>BedLunch</em> coming out first. Leave your email and
            you’ll hear about both as soon as they’re out.
          </p>
          <div className={styles.notify}>
            <NotifyForm />
          </div>
        </div>

        <div className={styles.artWrap}>
          <Art name="cat" label="A little cat casting a big cat-shaped shadow on the wall" className={styles.heroArt} />
        </div>
      </section>

      <section className={styles.releases} aria-labelledby="releases-heading">
        <h2 id="releases-heading" className={styles.sectionTitle}>
          On the way
        </h2>
        <ol className={styles.releaseList}>
          {releases.map((release) => (
            <li key={release.title} className={styles.release}>
              <Art
                name={release.art}
                label={
                  release.art === 'bedlunch'
                    ? 'Half a sandwich on the pillow of an unmade bed, under a moonlit window'
                    : 'A little cat casting a big shadow'
                }
                className={styles.cover}
              />
              <div className={styles.releaseText}>
                <p className={styles.releaseMeta}>
                  <span>{release.order}</span>
                  <span className={styles.badge}>{release.kind}</span>
                </p>
                <h3 className={styles.releaseTitle}>{release.title}</h3>
                <p>{release.body}</p>
                <p className={styles.releaseWhen}>{release.when}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {ARTIST_NAME === null && (
        <section className={styles.name} aria-labelledby="name-heading">
          <h2 id="name-heading" className={styles.sectionTitle}>
            Billed as
          </h2>
          <p className={styles.nameLede}>The name on the record is still being decided. In the running:</p>
          <ul className={styles.nameList}>
            {NAME_CANDIDATES.map((candidate) => (
              <li key={candidate}>{candidate}</li>
            ))}
          </ul>
          <p className={styles.nameNote}>The mailing list will be the first to know which one wins.</p>
        </section>
      )}

      <footer className={styles.footer}>
        <span>Little Big Cat</span>
        <span>The album, and BedLunch, the EP</span>
      </footer>
    </main>
  )
}
