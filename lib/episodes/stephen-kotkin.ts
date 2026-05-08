import { Episode } from "../types";

export const stephenKotkin: Episode = {
  slug: "stephen-kotkin",
  title: "Stephen Kotkin on the Dwarkesh Podcast",
  guest: "Stephen Kotkin",
  blurb: "Practice questions for Stephen Kotkin, drafted by the agent flashcard pipeline and human-reviewed before promotion.",
  transcriptPath: "transcripts/stephen-kotkin.md",
  note: "Prepared for a future offline pipeline run. Produces review artifacts only; does not edit lib/episodes.",
  sections: [
    {
      id: "opening",
      timestamp: "00:00:50",
      title: "Opening",
      cards: [
        {
          q: "According to Steven Kotkin, does modernization create a special dilemma for autocracies?",
          a: "To compete, an autocracy needs modern industry, workers, engineers, officers, and technical knowledge. But those same people can organize, strike, form political ideas, and demand rights. So the regime ends up repressing the very groups it needs to survive as a great power.",
        },
        {
          q: "What is Kotkin's argument that modernization is driven by geopolitics rather than just internal social development?",
          a: "States modernize because other powers force the issue. If rivals have steel ships, modern armies, armaments, or advanced industry, falling behind can mean subordination or conquest. Modernization is therefore a survival response to external competition, not just a society naturally becoming more advanced.",
        },
        {
          q: "Why does Kotkin think constitutional revolutions are harder once politics enters the mass age?",
          a: "Early liberal constitutional orders could be embedded under restricted franchises, then democratized over time. In the mass age, peasants, workers, and national groups are already mobilized, and many want land, social revolution, or national self-determination, not just rule of law and private property. Liberal constitutionalists can therefore be swept aside.",
        },
        {
          q: "Kotkin argues that a leftist revolution of one kind or another was likely to take place in Russia in 1917, but ...",
          a: "There did not have to be two of them, and the second did not have to be of the radical Communist variety.",
        },
      ],
    },
    {
      id: "00-23-45-the-peasants-brought-lenin-to-power-then-he-enslaved-them",
      timestamp: "00:23:55",
      title: "00:23:45 – The peasants brought Lenin to power, then he enslaved them",
      cards: [
        {
          q: "Why can land reform make peasants a stabilizing political force rather than a revolutionary one?",
          a: "Land-hungry peasants have reason to overthrow the system to get land. Peasants with secure holdings have a stake in the status quo: they can farm, accumulate, hire labor, and defend their property. In Kotkin's frame, property turns potential rebels into forces of order.",
        },
        {
          q: "Why did urban leftist revolt endure in Tsarist Russia in a way it often did not in Germany, Italy, or Hungary?",
          a: "In much of Central Europe, peasants had enough land and a stake in order, so peasant soldiers could help suppress urban leftist revolts. In Russia, the peasant army was itself radicalized by land hunger and was seizing land. The force that might have restored order was part of the revolution.",
        },
        {
          q: "What was the irony of the Russian peasants' land revolution, in Kotkin's telling?",
          a: "The peasant seizure of land wasn't about enthroning the Bolsheviks; peasants seized land **for themselves** and broke the grip of landowners and tsarism. Still, that disruptive peasant mobilization weakened the provisional political order enough for urban socialists, especially Lenin's faction, **to seize and cling to power**. Once the communist state stabilized, Stalin used that power **to forcibly overturn** peasant *de facto* landholding through collectivization—so peasants unintentionally fueled a revolution whose regime later ended the very land takeover they fought for.",
        },
        {
          q: "While both Stolypin and Stalin sought large-scale modern farming, how did their methods fundamentally differ?",
          a: "Both believed large-scale mechanized farming was necessary.\n\nStolypin believed this would come about by more successful farmers buying out the others and using profits to mechanize.\n\nSince this is obviously not socialist, Stalin viewed the only alternative solution as collectivization.",
        },
        {
          q: "Why does Kotkin think that collectivization of Soviet farming was unlikely without Stalin?",
          a: "That policy almost broke the regime, and nobody around Stalin had the appetite to go as far as he did.",
        },
      ],
    },
    {
      id: "00-37-38-stalin-and-the-road-to-war",
      timestamp: "00:37:38",
      title: "00:37:38 – Stalin and the road to war",
      cards: [
        {
          q: "According to Kotkin, what was Stalin's pre-war foreign policy objective, and how did communist ideology play into it?",
          a: "He wanted to divide the capitalist countries, such as Britain and Germany, and make them go to war with each other.\n\nSince the last World War led to a communist uprising, his hope was that another World War could lead to another revolution in a Western country.",
        },
      ],
    },
    {
      id: "01-02-26-today-s-leftist-civil-war",
      timestamp: "01:02:26",
      title: "01:02:26 – Today's leftist civil war",
      cards: [
        {
          q: "Why does abolishing private property and markets tend to produce 'state-ization' rather than freedom?",
          a: "If markets, private property, and individual choice are removed, allocation still has to happen somehow. The state becomes responsible for deciding who gets what, what gets produced, and how people comply. That pushes the system toward planning, rationing, command, and coercion.",
        },
      ],
    },
  ],
};
