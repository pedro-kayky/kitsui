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
  {
    slug: 'how-to-use-flashcards-the-right-way',
    title: 'How to Use Flashcards the Right Way: 8 Common Mistakes to Avoid',
    description:
      'Flashcards are powerful, but many learners use them in a way that wastes time. Learn the most common flashcard mistakes and how to fix them.',
    updated: 'October 26, 2026',
    body: () => (
      <>
        <p>
          Flashcards are one of the simplest tools for learning vocabulary, and one of the most
          misused. Many learners make a big deck, flip through it for a few weeks and then feel
          that nothing stays in their head. Most of the time the cards are not the problem. The
          way they are being used is. Here are eight common mistakes and how to fix each one.
        </p>

        <h2>1. Reading the answer instead of recalling it</h2>
        <p>
          The main benefit of a flashcard is that it makes you pull the answer out of memory.
          If you look at the front and immediately flip the card, you are only reading, and
          reading is a weak way to learn. Before you flip, stop for a few seconds and try to
          say the answer, out loud if you can. Even a wrong guess helps, because the correction
          that follows is easier to remember.
        </p>

        <h2>2. Studying in one long session</h2>
        <p>
          Two hours on Sunday feels productive, but it is not the best use of your time. Memory
          gets stronger when you come back to the same card after some time has passed. Short
          daily sessions of 10 to 15 minutes work better than one long session each week.
        </p>

        <h2>3. Pressing &quot;Easy&quot; when it was not easy</h2>
        <p>
          If a review system lets you rate each card, the rating decides when you see the card
          again. If you hesitated, guessed or got only part of it, be honest and choose a lower
          rating. A card marked Easy by mistake disappears for a long time, and you meet it
          again when you have already forgotten it.
        </p>

        <h2>4. Adding too many new cards at once</h2>
        <p>
          Every new card creates future reviews. Adding fifty words in one evening feels great,
          but within a week you may have more reviews than time. A small number of new cards
          every day, for example five to ten, is much easier to keep going for months.
        </p>

        <h2>5. Making cards that are too big</h2>
        <p>
          A card with a long definition, three examples and a list of related words is hard to
          answer and hard to rate. Keep each card to one idea. If a word has several meanings,
          start with the most common one and add the others later.
        </p>

        <h2>6. Only practicing in one direction</h2>
        <p>
          Looking at a foreign word and remembering its meaning (recognition) is easier than
          looking at the meaning and remembering the foreign word (production). If you want to
          speak and write, you need both. Once a word feels familiar, try testing it in the
          other direction too.
        </p>

        <h2>7. Learning words with no context</h2>
        <p>
          A single word with a one-word translation is easy to forget, and it does not show you
          how the word is used. Add a short example sentence to the card. The sentence gives
          your memory more to hold on to and teaches you grammar at the same time.
        </p>

        <h2>8. Giving up after a missed week</h2>
        <p>
          Everyone skips days. When you come back to a big pile of due cards, the best answer is
          not to quit. Do a small part each day until you catch up. Cards that you still
          remember will pass quickly, and the ones you forgot will be easy to recognize and
          learn again.
        </p>

        <h2>A simple habit to start with</h2>
        <ol>
          <li>Review your due cards first, before adding anything new.</li>
          <li>Try to answer before you flip, and rate yourself honestly.</li>
          <li>Add only a few new words with an example sentence.</li>
          <li>Stop when your time is up, even if you could do more. Coming back tomorrow matters more than one long day.</li>
        </ol>
        <p>
          If you want to understand why this works, read{' '}
          <Link to="/guides/what-is-spaced-repetition">What Is Spaced Repetition?</Link> To
          see how to build good cards, read{' '}
          <Link to="/guides/how-to-make-good-vocabulary-flashcards">
            How to Make Good Vocabulary Flashcards
          </Link>
          .
        </p>
        <p>
          Kitsui is built around these habits: you look up a word, save it to a deck and review
          it with Again, Hard, Good and Easy buttons. <Link to="/">Sign in</Link> to try it with
          your own words.
        </p>
      </>
    )
  },
  {
    slug: 'hiragana-katakana-kanji-where-to-start',
    title: 'Hiragana, Katakana and Kanji: Where Should You Start?',
    description:
      'Japanese uses three writing systems. Learn what hiragana, katakana and kanji are used for and the best order to study them as a beginner.',
    updated: 'October 26, 2026',
    body: () => (
      <>
        <p>
          One of the first things that surprises new learners is that Japanese uses three
          different writing systems at the same time, often in a single sentence. It can feel
          like too much, but each system has a clear job, and you do not need to learn them all
          at once. This guide explains what each one does and the order that works well for most
          beginners.
        </p>

        <h2>Hiragana: the base of the language</h2>
        <p>
          Hiragana is a set of 46 basic characters, and each one stands for a sound, such as か
          (ka), し (shi) or ま (ma). It is used for grammar: particles like は and を, verb and
          adjective endings, and many everyday words that have no kanji. It is also what
          children learn first in Japan.
        </p>
        <p>
          Because every character is a sound, hiragana lets you read and pronounce almost any
          Japanese word. This is why it is the first thing to learn.
        </p>

        <h2>Katakana: for foreign words and emphasis</h2>
        <p>
          Katakana also has 46 basic characters and the same sounds as hiragana, but the shapes
          are different and more angular. It is mostly used for words borrowed from other
          languages, like コーヒー (koohii, &quot;coffee&quot;) and テレビ (terebi,
          &quot;television&quot;). It is also used for many foreign names, for sound effects and
          sometimes for emphasis.
        </p>
        <p>
          Many learners find katakana harder to remember than hiragana at first, because the
          shapes look alike (シ and ツ are a famous pair). Practice with real words, not only
          with charts.
        </p>

        <h2>Kanji: characters with meaning</h2>
        <p>
          Kanji are characters that came from Chinese. Unlike kana, a kanji carries a meaning.
          For example, 水 means &quot;water&quot; and 学 relates to &quot;study&quot;. Kanji
          are used for the core of many nouns, verbs and adjectives. Japan&apos;s official list
          of everyday kanji has 2,136 characters, which is a lot, but you can start reading
          real Japanese long before you know all of them.
        </p>
        <p>
          Most kanji have more than one reading. A native Japanese reading is called kun&apos;yomi
          and a reading that came from Chinese is called on&apos;yomi. You do not need to
          memorize both for each character on the first day. Learn them as they appear in words.
        </p>

        <h2>The order that works for most learners</h2>
        <ol>
          <li>
            <strong>Hiragana first.</strong> Many people can learn all 46 characters in a few
            days or weeks of short daily practice.
          </li>
          <li>
            <strong>Katakana next.</strong> It follows the same sounds, so it usually feels
            faster the second time.
          </li>
          <li>
            <strong>Kanji together with vocabulary.</strong> Start with simple and common ones
            like 日, 人, 水 and 学, and learn them inside words.
          </li>
        </ol>

        <h2>How the three work in one sentence</h2>
        <p>
          Take the sentence 私はコーヒーを飲みます (watashi wa koohii o nomimasu, &quot;I drink
          coffee&quot;). The kanji (私, 飲) carry the main meanings. The katakana (コーヒー) is
          a borrowed word. The hiragana (は, を, み, ま, す) holds the grammar. Once you see
          this pattern, Japanese text looks much less mysterious.
        </p>

        <h2>Tips for studying them</h2>
        <ul>
          <li>Write each character a few times by hand to remember its shape and stroke order.</li>
          <li>Use flashcards with spaced repetition so that you review the hard ones more often.</li>
          <li>Read furigana, the small hiragana above kanji, while you are still learning.</li>
          <li>Do not wait to know every kana perfectly before you learn your first words.</li>
        </ul>
        <p>
          When you are ready for kanji, continue with{' '}
          <Link to="/guides/how-to-learn-kanji-through-words">How to Learn Kanji Through Words</Link>
          . In Kitsui, Japanese translations show furigana above the kanji, so you can read new
          words as you save them. <Link to="/">Sign in</Link> to start your first deck.
        </p>
      </>
    )
  },
  {
    slug: 'how-to-learn-kanji-through-words',
    title: 'How to Learn Kanji Through Words, Not One by One',
    description:
      'Learning kanji in isolation is slow and easy to forget. Learn why studying kanji inside real words works better and how to do it step by step.',
    updated: 'October 26, 2026',
    body: () => (
      <>
        <p>
          A common way to study kanji is to take a list and memorize one character at a time,
          with its meanings and readings. It looks organized, but many learners find that the
          characters fade quickly and that they still cannot read real text. A more natural way
          is to learn kanji through the words that contain them.
        </p>

        <h2>The problem with learning kanji alone</h2>
        <p>
          A single kanji often has several meanings and more than one reading, and you cannot
          tell which one to use without context. Memorizing all of them for one character is a
          lot of work for something you may not use in that form. Also, a kanji by itself is
          rarely a complete word in everyday reading.
        </p>

        <h2>Why words work better</h2>
        <p>
          Words give kanji a purpose. When you learn 食べる (taberu, &quot;to eat&quot;), you
          get the kanji 食, the way it is read in this word, and a real meaning, all at once.
          Later you meet 食事 (shokuji, &quot;meal&quot;) and 食堂 (shokudou,
          &quot;cafeteria&quot;), and the same character comes back in a new place. Each new
          word reviews the old one.
        </p>
        <p>
          The same thing happens with 学. You see it in 学校 (gakkou, &quot;school&quot;), 学生
          (gakusei, &quot;student&quot;) and 大学 (daigaku, &quot;university&quot;). By the third
          word, you already know what the character is about.
        </p>

        <h2>A step-by-step method</h2>
        <ol>
          <li>
            <strong>Start with common words.</strong> Pick words you will really meet, like
            days of the week, food, school and transport.
          </li>
          <li>
            <strong>Save the reading with the word.</strong> Always keep the reading together
            with the kanji, for example 学校 and がっこう.
          </li>
          <li>
            <strong>Add one example sentence.</strong> A sentence shows how the word is used and
            helps you recall the reading.
          </li>
          <li>
            <strong>Notice the shared kanji.</strong> When a new word has a kanji you already
            know, take a moment to see the connection. That small step builds a lot of
            understanding.
          </li>
          <li>
            <strong>Review with spaced repetition.</strong> Words you see at growing intervals
            stay for months.
          </li>
        </ol>

        <h2>Look for the parts inside a kanji</h2>
        <p>
          Many kanji are built from smaller parts, called radicals, that give a hint about the
          meaning. For example, the part 氵 (three drops) often relates to water. You can see it
          in 海 (umi, &quot;sea&quot;), 泳ぐ (oyogu, &quot;to swim&quot;) and 池 (ike,
          &quot;pond&quot;). Another example is 休む (yasumu, &quot;to rest&quot;), which shows
          a person (亻) next to a tree (木). These hints are not perfect, but they make a new
          character feel less random.
        </p>

        <h2>Do I still need to write kanji by hand?</h2>
        <p>
          Writing by hand helps many people remember shapes and stroke order, so it can be a
          useful extra. But if your goal is reading, recognizing the kanji in words matters more
          than being able to draw each one from memory. Decide based on your goal.
        </p>

        <h2>Be patient</h2>
        <p>
          You will forget some kanji, and that is normal. What matters is meeting them again,
          in new words, over time. Ten or fifteen minutes each day will take you further than a
          weekend of cramming.
        </p>
        <p>
          If you are new to the writing system, start with{' '}
          <Link to="/guides/hiragana-katakana-kanji-where-to-start">
            Hiragana, Katakana and Kanji: Where Should You Start?
          </Link>{' '}
          In Kitsui, you can look up a Japanese word, see the reading above each kanji, save it
          to a deck and review it later. <Link to="/">Sign in</Link> to try it.
        </p>
      </>
    )
  },
  {
    slug: 'how-to-make-good-vocabulary-flashcards',
    title: 'How to Make Good Vocabulary Flashcards (With Examples)',
    description:
      'Good flashcards are small, clear and include context. Learn how to design vocabulary cards that are easier to remember, with before and after examples.',
    updated: 'October 26, 2026',
    body: () => (
      <>
        <p>
          Two learners can study the same word for the same amount of time and get very
          different results. Often the difference is the card itself. A good flashcard is easy
          to answer, easy to rate and gives your memory something to hold on to. A bad one is
          long, vague or has no context. Here is how to build better cards.
        </p>

        <h2>1. One idea per card</h2>
        <p>
          A card should ask one thing. If you put a word, five meanings and three synonyms on
          the same card, you will almost never get everything right, and you will not know how
          to rate yourself. Pick the most useful meaning first. You can always add another card
          for another meaning later.
        </p>

        <h2>2. Keep the answer short</h2>
        <p>
          The back of the card should be something you can say in a few seconds. A short
          translation is better than a dictionary paragraph. If the answer is long, the review
          becomes slow, and you start to skip the card.
        </p>

        <h2>3. Include the reading and pronunciation</h2>
        <p>
          For languages with a different writing system, the reading is part of the word. In
          Japanese, a card for 勉強 should also keep べんきょう (benkyou). Without it you may
          recognize the word on screen and still not be able to say it.
        </p>

        <h2>4. Add a short example sentence</h2>
        <p>
          An example sentence shows how a word behaves with other words, which is often what you
          need to use it yourself. Keep the sentence short and natural, with simple words that
          you already know. For example:
        </p>
        <ul>
          <li>Weak card: 勉強 = study</li>
          <li>
            Better card: 勉強 (benkyou) = study. Example: 毎日日本語を勉強します。
            (&quot;I study Japanese every day.&quot;)
          </li>
        </ul>

        <h2>5. Use your own words when you can</h2>
        <p>
          A meaning that you phrase yourself is usually easier to remember than a copy of a
          definition. If a translation is confusing, rewrite it in a way that makes sense to
          you.
        </p>

        <h2>6. Avoid learning very similar words together</h2>
        <p>
          If you learn two words that look or sound alike on the same day, your memory can mix
          them up. Space them out, or add a small note that explains the difference. Mixing up
          similar words is one of the most common reasons for repeated wrong answers.
        </p>

        <h2>7. Check what you save</h2>
        <p>
          Translations from dictionaries, apps and AI tools can be wrong or can miss the
          meaning of the context. If a word is important, compare it with a good dictionary
          before it goes into your deck. A wrong card can be memorized very well.
        </p>

        <h2>8. Remove or fix cards that never work</h2>
        <p>
          If you keep getting the same card wrong, the problem may be the card. Make it simpler,
          add a better example or split it into two. Do not feel bad about deleting a word that
          you do not need.
        </p>

        <h2>A checklist before you save a card</h2>
        <ol>
          <li>Is there only one idea on it?</li>
          <li>Can I answer it in a few seconds?</li>
          <li>Does it have the reading and a short example sentence?</li>
          <li>Did I check that the meaning is correct?</li>
        </ol>
        <p>
          To learn how to review these cards, read{' '}
          <Link to="/guides/how-to-use-flashcards-the-right-way">
            How to Use Flashcards the Right Way
          </Link>
          . In Kitsui, each lookup already shows the meaning, the reading and an example
          sentence, and you can save the word or the sentence to a deck in one tap. Remember
          that the translations are generated by AI, so check the ones that matter.{' '}
          <Link to="/">Sign in</Link> to build your first deck.
        </p>
      </>
    )
  },
  {
    slug: 'anki-vs-kitsui',
    title: 'Anki vs. Kitsui: Which Flashcard App Fits You?',
    description:
      'A fair comparison between Anki and Kitsui for language learners: setup, customization, card creation and who each app is best for.',
    updated: 'October 26, 2026',
    body: () => (
      <>
        <p>
          Anki is one of the best-known flashcard programs in the world, and it has been a
          favorite of language learners for many years. Kitsui is a newer, simpler web app that
          was inspired by Anki. They share the same core idea, spaced repetition, but they are
          made for different kinds of users. This is a fair look at both, so you can choose the
          one that fits you.
        </p>

        <h2>What they have in common</h2>
        <ul>
          <li>Both use spaced repetition to schedule your reviews.</li>
          <li>Both let you rate a card, so that hard cards return sooner and easy ones later.</li>
          <li>Both are meant to help you remember vocabulary for the long term.</li>
        </ul>

        <h2>Anki: powerful and very flexible</h2>
        <p>
          Anki is a free and open-source program for computers, with an Android app, and a
          paid app for iPhone and iPad. Its biggest strength is flexibility. You can make
          almost any kind of card, with images, audio and custom layouts, and there is a large
          community that shares decks and add-ons. If you want full control, Anki gives it.
        </p>
        <p>
          The other side of that flexibility is a learning curve. New users often need time to
          understand note types, decks and settings before they feel comfortable. Making a good
          vocabulary card from scratch also takes some work, because you type or paste each
          part yourself.
        </p>

        <h2>Kitsui: simple and focused on vocabulary</h2>
        <p>
          Kitsui works in your browser and is built around one flow: look up a word or short
          phrase, see its meaning, its reading and an example sentence, save it to a deck in
          one tap and review it later. For Japanese, the reading appears as furigana above the
          kanji. You sign in with a Google account, so your decks stay with your account and
          follow you between your phone and your computer.
        </p>
        <p>
          The trade-off is that Kitsui is newer and has fewer options. You cannot customize
          cards as deeply as in Anki, and the translations and example sentences are generated
          by AI, so they can contain mistakes. It is a good idea to check important words in a
          dictionary.
        </p>

        <h2>A quick comparison</h2>
        <ul>
          <li>
            <strong>Setup:</strong> Anki needs installation and some learning. Kitsui runs in
            the browser and starts with a lookup.
          </li>
          <li>
            <strong>Creating cards:</strong> In Anki you build them yourself or download decks.
            In Kitsui they are created from your lookups.
          </li>
          <li>
            <strong>Customization:</strong> Anki is much more customizable. Kitsui is simpler.
          </li>
          <li>
            <strong>Cost:</strong> Anki is free on computers and Android, and paid on iPhone and
            iPad. Check the app for the current price of Kitsui.
          </li>
          <li>
            <strong>Best for:</strong> Anki suits learners who want control and many card types.
            Kitsui suits learners who want to save words quickly and start reviewing.
          </li>
        </ul>

        <h2>So which one should you choose?</h2>
        <p>
          If you enjoy tweaking settings, want to study subjects beyond language or already
          have decks you like, Anki is a strong choice. If you mostly want to look up words you
          meet in daily life and review them without setting anything up, Kitsui may be easier
          to keep using. What matters most is that you pick a tool you will open every day.
        </p>
        <p>
          Whichever you choose, the habits are the same. Read{' '}
          <Link to="/guides/how-to-use-flashcards-the-right-way">
            How to Use Flashcards the Right Way
          </Link>{' '}
          and{' '}
          <Link to="/guides/how-to-make-good-vocabulary-flashcards">
            How to Make Good Vocabulary Flashcards
          </Link>{' '}
          to get the most from either app. If you want to try Kitsui, <Link to="/">sign in</Link>{' '}
          and save your first word.
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