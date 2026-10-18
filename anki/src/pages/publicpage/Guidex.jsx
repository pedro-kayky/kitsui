import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicPage from './publicpage';

/* ------------------------------------------------------------------
   LISTA DE GUIAS
   Para adicionar um guia novo: copie um item abaixo, mude o slug
   (o endereço), o título, a descrição e o texto em "body".
------------------------------------------------------------------- */
const GUIDES = [
  {
    slug: 'what-is-spaced-repetition',
    title: 'What Is Spaced Repetition? A Simple Guide for Language Learners',
    description:
      'Learn what spaced repetition is, why it helps you remember vocabulary for longer and how to use it to study a language with flashcards.',
    updated: 'October 18, 2026',
    body: () => (
      <>
        <p>
          You study a new word on Monday and it feels easy. By Friday it is gone. This is not a
          sign that you are bad at languages. It is how human memory works, and spaced repetition
          is the method that works with it instead of against it.
        </p>

        <h2>Why we forget new words</h2>
        <p>
          In 1885 the German psychologist Hermann Ebbinghaus studied how quickly people forget
          things they have just learned. He found that forgetting is fastest right after learning
          and then slows down. Without any review, most of a new word fades within days.
        </p>
        <p>
          The good news is that every time you recall something, the memory becomes stronger and
          fades more slowly. The question is when to review it.
        </p>

        <h2>What spaced repetition is</h2>
        <p>
          Spaced repetition means reviewing information at increasing intervals. You see a new
          card soon after learning it, then after a day, then after a few days, then after a week
          or more. Each time you remember it, the gap grows. Each time you forget it, the gap
          shrinks again.
        </p>
        <p>
          The idea is to review a word <strong>just before you would forget it</strong>. Reviewing
          too early wastes time, and reviewing too late means you have to learn it again.
        </p>

        <h2>Why it works</h2>
        <ul>
          <li>
            <strong>The spacing effect.</strong> Studying in several short sessions over time
            produces stronger memory than cramming the same material in one long session.
          </li>
          <li>
            <strong>Active recall.</strong> A flashcard asks you to remember the answer before you
            see it. Pulling a word out of memory trains it much more than simply reading it again.
          </li>
          <li>
            <strong>Focus on what is hard.</strong> Easy cards come back rarely and difficult ones
            come back often, so your time goes where it is needed.
          </li>
        </ul>

        <h2>A simple example</h2>
        <p>
          Imagine you learn the Japanese word 勉強 (benkyou, &quot;study&quot;). A typical schedule
          could look like this: you see it again after 10 minutes, then the next day, then after 3
          days, then after about a week, then after about three weeks. If at any point you answer
          wrong, the card goes back to a short interval and starts climbing again. After a few
          successful reviews, you can remember a word for months with only a few seconds of
          effort each time.
        </p>

        <h2>How to get the most from it</h2>
        <ol>
          <li>
            <strong>Review a little every day.</strong> Ten minutes daily is better than one hour
            on the weekend. The schedule only works if you come back when cards are due.
          </li>
          <li>
            <strong>Be honest with the buttons.</strong> If you hesitated or guessed, do not press
            &quot;Easy&quot;. A wrong rating only delays the review you needed.
          </li>
          <li>
            <strong>Learn words in context.</strong> Save an example sentence, not only the word.
            Context gives your memory more hooks to hold on to.
          </li>
          <li>
            <strong>Keep cards small.</strong> One word or one idea per card is easier to recall
            than a long list.
          </li>
          <li>
            <strong>Do not let reviews pile up.</strong> If you skip many days, do a few cards at
            a time until you catch up instead of giving up.
          </li>
        </ol>

        <h2>Spaced repetition in Kitsui</h2>
        <p>
          Kitsui uses a system inspired by Anki. When you review a card you choose Again, Hard,
          Good or Easy, and each button shows how long until you see the card again. New cards
          start with short steps of a few minutes, and once you know a card the intervals grow to
          days, weeks and months. If you press Again, the card comes back soon and its growth
          slows down.
        </p>
        <p>
          To try it, <Link to="/">sign in</Link>, look up a word, add it to a deck and start your
          first review.
        </p>
      </>
    )
  },
  {
    slug: 'how-to-learn-japanese-vocabulary-faster',
    title: 'How to Learn Japanese Vocabulary Faster: 7 Practical Tips',
    description:
      'Practical tips to learn Japanese vocabulary faster: start with common words, learn readings and kanji together, use example sentences and review with spaced repetition.',
    updated: 'October 18, 2026',
    body: () => (
      <>
        <p>
          For most learners, vocabulary is the slowest part of Japanese. Kanji, readings and
          words that look nothing like your own language make it easy to feel stuck. The good
          news is that a few simple habits can make learning much faster and much less
          frustrating. Here are seven that work.
        </p>

        <h2>1. Start with the words you will meet most often</h2>
        <p>
          Not all words are equally useful. A small group of common words appears again and again
          in everyday conversation, so learning those first gives you the biggest result for
          your time. Begin with everyday verbs, basic adjectives and words for daily life like
          food, school, work and transport. Rare words can wait.
        </p>

        <h2>2. Learn the reading together with the word</h2>
        <p>
          In Japanese, the way a word is written does not always tell you how to say it. For
          example, 学校 is read がっこう (gakkou, &quot;school&quot;). If you learn only the
          kanji, you will recognize it on paper but not when you hear it. Always save the
          reading with the word. Furigana, the small kana written above kanji, is a great help
          for this while you are still learning to read.
        </p>

        <h2>3. Learn words inside sentences</h2>
        <p>
          A word alone is easy to forget. A word inside a sentence comes with grammar, with
          particles and with a situation where it is used. Saving one short example sentence
          with each new word helps you remember it and shows you how it really works. For
          instance, 勉強 (benkyou, &quot;study&quot;) is much easier to remember after you see
          it in a sentence about studying Japanese.
        </p>

        <h2>4. Let words teach you kanji</h2>
        <p>
          Many learners try to memorize kanji one by one, with no context. It is usually easier
          to learn kanji through the words that contain them. When you learn 食べる (taberu,
          &quot;to eat&quot;), you also learn the kanji 食. When you later meet 食事 (shokuji,
          &quot;meal&quot;), you already know part of it. Over time, you start to see the same
          pieces everywhere.
        </p>

        <h2>5. Review a little every day with spaced repetition</h2>
        <p>
          Learning a word once is not enough. You need to see it again, at the right time.
          Spaced repetition shows you each card just before you are likely to forget it, so
          every review makes the memory stronger. Ten minutes every day beats an hour once a
          week. If you want to know how it works in detail, read our guide{' '}
          <Link to="/guides/what-is-spaced-repetition">What Is Spaced Repetition?</Link>
        </p>

        <h2>6. Do not add too many new words at once</h2>
        <p>
          It is tempting to save fifty words in one evening. But each new word will come back
          for review, and a big pile of cards can become overwhelming within a few days. A small
          and steady number of new words per day, for example five to ten at the beginning, is
          easier to keep for months. Consistency is more important than speed.
        </p>

        <h2>7. Use the words, do not only collect them</h2>
        <p>
          Words you use are words you keep. Try to write one sentence with a new word, say it
          out loud, or look for it in something you read or listen to. Even a short sentence
          about your day, written in Japanese, makes the word more yours than ten extra
          reviews.
        </p>

        <h2>A simple 10-minute routine</h2>
        <ol>
          <li>Review the cards that are due today (about 5 minutes).</li>
          <li>Look up and save 3 to 5 new words that you met today, with an example sentence (about 3 minutes).</li>
          <li>Write or say one sentence using one of the new words (about 2 minutes).</li>
        </ol>

        <h2>How Kitsui can help</h2>
        <p>
          Kitsui puts these steps in one place. You type a word, see its meaning, its reading
          with furigana and an example sentence, save it to a deck in one tap and review it with
          spaced repetition. Remember that the translations are generated by AI and can contain
          mistakes, so check important words in a dictionary.
        </p>
        <p>
          Ready to try it? <Link to="/">Sign in</Link>, save your first word and start with a
          short review today.
        </p>
      </>
    )
  },
];

function GuideList() {
  return (
    <PublicPage
      title="Language Learning Guides"
      description="Practical guides on learning languages with flashcards, spaced repetition and vocabulary study."
    >
      <p>
        Short, practical guides to help you study vocabulary and remember it for longer. More
        guides are added regularly.
      </p>

      <div className="guides-list">
        {GUIDES.map((guide) => (
          <article key={guide.slug} className="guide-card">
            <h2>
              <Link to={`/guides/${guide.slug}`}>{guide.title}</Link>
            </h2>
            <p>{guide.description}</p>
            <Link to={`/guides/${guide.slug}`} className="guide-read">
              Read the guide →
            </Link>
          </article>
        ))}
      </div>

      <style>{`
        .guides-list { display: grid; gap: 16px; margin-top: 8px; }
        .guide-card {
          background: #161821;
          border: 1px solid #2b2b3d;
          border-radius: 14px;
          padding: 18px 20px;
        }
        .guide-card h2 { margin: 0 0 8px; font-size: 1.15rem; }
        .guide-card h2 a { color: #ffffff; text-decoration: none; }
        .guide-card h2 a:hover { color: #a5b4fc; }
        .guide-card p { margin: 0 0 10px; }
        .guide-read { font-weight: 600; font-size: 0.95rem; }
      `}</style>
    </PublicPage>
  );
}

function GuideArticle({ guide }) {
  return (
    <PublicPage title={guide.title} description={guide.description} updated={guide.updated}>
      <p>
        <Link to="/guides">← All guides</Link>
      </p>

      {guide.body()}

      <p style={{ marginTop: 28 }}>
        <Link to="/guides">← Back to all guides</Link>
      </p>
    </PublicPage>
  );
}

export default function Guides() {
  const { slug } = useParams();

  if (!slug) return <GuideList />;

  const guide = GUIDES.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <PublicPage title="Guide not found" description="This guide does not exist.">
        <p>We could not find this guide.</p>
        <p>
          <Link to="/guides">See all guides</Link>
        </p>
      </PublicPage>
    );
  }

  return <GuideArticle guide={guide} />;
}