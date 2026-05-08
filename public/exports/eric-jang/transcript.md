**DWARKESH** 0:00:00

Today I'm here with Eric Jang, who was most recently vice president of AI at 1X Technologies, before that, senior research scientist at what is now Google DeepMind Robotics. You've been on sabbatical for the last few months. One of the things you've been doing is rebuilding and improving and hacking on AlphaGo, and so today what we're gonna do is you're gonna explain building AlphaGo from scratch and what it tells us about the future of AI research and development. But before we get to that, why is AlphaGo interesting? Why is this the project you decided to do on sabbatical rather than just hang out at the beach?

**ERIC** 0:00:34

Sure, yeah. I like making things, and AlphaGo and Go AI is one of those things that really got me into the field. When I saw the early breakthroughs on AlphaGo in 2014, 2015, 2016 and so forth, it was just profound to see how smart AI systems could become and the kind of computational complexity class that they could tackle with deep learning.

This is a problem that has long been understood to be intractable for a search, and yet it was solved through deep learning. And so that was quite mysterious to me, and I've always wanted to understand that phenomena a little bit better. My training is often in deep neural nets for robotics, where the decisions made by the neural networks are a bit more intuitive, but AlphaGo is a sort of problem where the decisions are actually the result of a very, very deep search. And it's always been very mysterious to me how a 10-layer network can sort of amortize the simulation of something so deep in the game tree.

**DWARKESH** 0:01:39

And I think maybe it's worth emphasizing, you're gonna explain on the blackboard how AlphaGo works, but what is especially interesting is that you have beat what is the best open source Go-playing bot, and the process by which you've done it at least partially involves having AI automate the process of research and development of AI, which is after we understand Go, we're gonna have a conversation about what that would mean for LLM training.

**ERIC** 0:02:08

If you plot out how much compute it took to build various iterations of strong Go bots over the years, you can see that in 2020 there was a open source project called KataGo by David Wu from Jane Street, who basically achieved a 40x reduction in compute needed to train a really strong Go bot, tabula rasa. I'm not certain if it's stronger than AlphaGo Zero or Alpha Zero or MuZero, but it's very, very strong, and this is what most Go practitioners today train against when they're playing an AI.

So one of the goals for me was to see if I could beat this baseline, and see if I could do it with less compute, less sort of compute multiplier tricks that David used in his KataGo effort, and just see if the sort of bitter lesson six years after KataGo have made it kind of easier to make a strong Go AI without as many of these algorithmic tricks. The short answer is that, yes, indeed, you can get rid of some tricks, and some other tricks still remain very useful. But thanks to LLM coding, what took a whole team of research scientists at DeepMind and millions of dollars of research and compute can now be done for a few thousand dollars of rented compute.

**DWARKESH** 0:03:17

Okay, should we understand how Go works first?

**ERIC** 0:03:19

Great, yes. Like many, like probably most of the audience, I actually went into this project not knowing how to play Go at all. So the first week I spent a little bit of time just understanding the basic intuition of the game so that I don't make any silly mistakes in implementing the rules of Go. It's a very simple game, but it's just important to know these correctly so that you can spot bugs easily. So often it's good to build an intuition of how the game works.

So it's a very simple game, and the basic objective is to put black and white stones onto the board and capture your opponent's stones and occupy the most territory by the end of the game. So players take turns putting stones on the board. So I'm gonna begin by putting down a black stone. Black always goes first. And then it's now your turn, and you go ahead and put down a white stone.

Great. The objective is to occupy territory, and the way that you can capture an opponent's piece, much like in chess, is to essentially surround their piece with your stones. So hypothetically, if I were to place four stones around your white stone, then this piece would be removed, and now I control this territory.

**DWARKESH** 0:49:55

Okay. I guess we should first discuss how Go works. So yeah, how does the game work?

**ERIC** 0:50:00

It's super important when you're implementing an AI to understand the basic mechanics of the game. You just need to understand at an amateur level and then you can actually train a pretty strong Go bot, but it's important to know the rules so that you don't make a implementation bug or you don't reward hack.

The game of Go is a very simple one that can be implemented quickly and easily in a computer. The objective of the game is basically to put down black and white stones and try to occupy as much territory in the game as possible. So I might start by putting down a black stone. Black always goes first.

And just go ahead.

So the basic objective is to try to capture your opponent's stones. And so the way you capture an opponent's stones is that for every intersection, if you can surround all four of its neighbors with your stones, then this one is sort of cut off from oxygen, if you will, and then it is a dead stone. So then now I control these four stones as well as this empty intersection here. If I had a larger empty space, this would also be my territory as well.

So that's the basic idea. There are different formations in Go that represent different kinds of strengths. So this particular formation has two empty eyes, and what that means is that it's actually impossible for you to now capture this group. Because if you were to put down a white stone here, I could immediately recapture your stone by putting one here.

In Go, if you were to put down a white stone into this empty intersection, it depends on different rule sets, so there's slight variations between Chinese, Japanese, and what is called Trump-Taylor rules. Trump-Taylor rules are designed to be completely unambiguous for Go, so this is what all Go AIs train against and resolve against. So in typical Go, like when humans play, you're actually not allowed to put this white stone down here. It would be instant suicide. In Trump-Taylor, it's actually fine. You put it down, and then it immediately resolves to death. So the outcome is sort of the same.

So that's the basic mechanics of capturing stones. So let's go ahead and start over and play a few stones, and then I'll explain some more.

**DWARKESH** 0:7:15

I'll just start there.

**ERIC** 0:7:16

All right, I'm basically playing randomly here, but I'm trying to get around your stones and see if I can block them.

**DWARKESH** 0:7:26

Sounds good.

**ERIC** 0:7:36

So this move basically exposes one empty neighbor for your white stone, and it's very akin to a check in chess where if you don't respond immediately by putting one here, then I can immediately capture this.

**DWARKESH** 0:7:47

Because it is sort of the diagonals that determine whether or not you're going to-

**ERIC** 0:7:51

The cross section, not the diagonals. So this one is surrounded on three sides. And so you're at threat of losing that stone if you don't play one immediately there.

Now, you can see that I'm starting to pressure you, because by putting a stone here, now you are forced to put one here.

**DWARKESH** 0:8:10

Otherwise, you would have this two block to yourself.

**ERIC** 0:8:13

And then if you think through what happens if you were to respond here, you can probably search into the future and deduce what I'll do in response once you do that.

**DWARKESH** 0:8:23

You have a lot of confidence in my abilities, but I'm guessing you'd put the black here.

**ERIC** 0:8:26

That's right, and then I would capture all three of those stones.

**DWARKESH** 0:8:28

So I should just assume that this is gone? This whole block is gone?

**ERIC** 0:8:31

Yes.

**DWARKESH** 0:8:32

Or I could just try to make it hard for you to capture it.

**ERIC** 0:8:34

I would still capture that in that case. So in Go, it's actually okay to let an opponent capture some stones if, for example, it allows you to position to capture more stones in somewhere else on the board. And this is what makes Go a very beautiful game, is that you can kind of lose the battle, but win the war. And as the board size increases, the complexity of these kind of micro versus macro dynamics gets more interesting.

**DWARKESH** 0:9:00

Okay, so if I put... If you, presumably you'd put one here.

**ERIC** 0:9:06

And so now I would capture this entire group.

**DWARKESH** 0:9:08

And this would be mine. But I can't do this to use my previous ones to capture yours.

**ERIC** 0:9:12

No, that's right. So there is a situation that's where you can kind of do this, where you might have a formation, let's say, that looks like... So let's suppose, let's suppose it looked like this.

**DWARKESH** 0:9:32

Yeah.

**ERIC** 0:9:33

And then so you put down a stone here to capture my stone, like this, and then I put down a stone here.

**DWARKESH** 0:9:41

Yeah.

**ERIC** 0:9:42

And then later, if let's say we play somewhere else, I come back and I put a stone here, I can actually capture this one.

**DWARKESH** 0:9:48

Interesting.

**ERIC** 0:9:48

So groups with one eye like this, or one sort of empty intersection in the middle, are not actually secure. The only way to make it secure is to actually have at least two eyes. And so that's how to make a secure group. Okay, there's one more case that I wanna demonstrate, which I had a bug in my code recently, which is the following situation. So I'm gonna rearrange some things on the board.

**DWARKESH** 0:10:14

Oh, you made your own engine. You weren't using OpenSpiel or something?

**ERIC** 0:10:16

No, no. I started with that, but I ended up building my, well, asking the AI to write my own.

**DWARKESH** 0:10:22

And is it for inference optimizations and stuff?

**ERIC** 0:10:24

Correct. Just for speed optimizations. Because you can't easily multi-thread someone else's engine within your own MCTS loops and so forth. So let's consider a formation like this. And then, you know, we have other pieces on the board in play or whatever. And so let's talk a little bit about how the game ends. In this territory, who owns this territory?

**DWARKESH** 0:10:52

This, inside?

**ERIC** 0:10:54

Like who controls these areas? Is it white or is it black?

**DWARKESH** 0:10:58

White.

**ERIC** 0:11:00

It's actually black, because I have actually surrounded this whole area. And it's very... Assuming I have other black stones here, it's actually very hard for you to break this out of the control of these stones.

**DWARKESH** 0:11:12

So when the final score is tallied, would these ones also count as being in?

**ERIC** 0:11:16

Yeah, great question. So this is where different rule sets have different ways of scoring, and so we should talk a little bit about how you resolve scores between humans and how you resolve scores between computer code. Because there's actually some ambiguity in how humans evaluate this. So most humans would look at this board configuration and conclude that black has totally surrounded white, and so white has no chance of life. We could play out more here, but then at the end, I would capture everything.

**DWARKESH** 0:11:46

And sorry, by that you just mean, like, if I try to do this?

**ERIC** 0:11:49

Yeah, let's play it out.

**DWARKESH** 0:11:51

Yeah.

**ERIC** 0:11:52

And then... So then I might do this.

**DWARKESH** 0:11:56

And then I'll do...

**ERIC** 0:11:58

Right. So at this point, you have one liberty left that this group is connected to. When I remove that final liberty, everyone dies.

**DWARKESH** 0:12:06

Got it.

**ERIC** 0:12:07

And so conceptually, one naive thought you might have is, like, who's to say that the black is surrounding the white or the white is surrounding the black? Intuitively, you're correct. However, if you have a way of breaking this formation and connecting white to something outside of it, then it can flip. And so this is where it's a little bit hard for a computer to decide these kind of things. So how is this resolved?

Let's first talk about the computer version of this. So in what is known as Tromp-Taylor scoring, it's perfectly unambiguous, so it can be decided algorithmically by a computer. It turns out that these points at the end... So if let's say you have this at the end game, the way you score this is that you first count how many stones you control, and that's unambiguous. Then you count how many empty intersections that are not touched by your opponent's stones. So these intersections would not count for either player because all of these intersections are connected to both white stones and black stones. If this were like this, then white would get three points.

Now, this is a little odd because a human would know that white is actually losing these points. But Tromp-Taylor scoring would consider white to have all of these points as well as these points.

**DWARKESH** 0:13:35

How does the game end?

**ERIC** 0:13:43

The game ends when either a player chooses to resign or both players pass consecutively. So I have to pass, and then you have to pass, or you have to pass, and then I have to pass.

**DWARKESH** 0:13:53

And then for computers, it literally just goes until they fill in every single... Like AlphaGo plays until every single box is filled in?

**ERIC** 0:13:59

No. By training the model to win under Tromp-Taylor scoring, it will actually learn a pretty good way to resign early if it thinks it's gonna lose. But under Tromp-Taylor scoring, you're supposed to play to the bitter end. So that's what makes it unambiguous is that if we don't consider early resignation, these things resolve because the Go AIs play this until it's fully captured.

So how do humans do it? It's worth thinking a little bit about how humans resolve this because this will actually map later to how we think about the deep neural network. Humans basically say, "I think the game is done," and then you have to also say, "I think the game is done." And then we'll say, "I think these are my stones," and then you have to agree. If you don't agree, then we keep playing. So essentially, once two humans, their so-called value function, agree on a consensus, then the Chinese rules resolve that.

Essentially, humans don't wanna play these things in the micro battles all the way out. So they just kind of know what the outcome is based on this kind of local fight. Now, a galaxy brain Go AI might actually see a way out of this, for example, a way to break the formation and so forth. And this is where extremely high levels of AI play might make the ability to resolve what a human would normally conclude a lost cause or something.

**DWARKESH** 0:15:18

Yeah.

**ERIC** 0:15:19

So yeah, that's the basics of scoring. The game ends when both players consecutively pass. And the computer Go scoring does require you to play these to the bitter end so that you can kind of decisively determine who actually controls this area.

But in practice, once you train the model, the models will actually learn that over time, very quickly, that these are bad positions and then it'll just give up.

**DWARKESH** 0:15:41

Yeah, makes sense.

**ERIC** 0:15:41

Okay, great. So we've learned the basics of Go. There's one more thing to add, which is that since black gets to go first, they actually have a very strong advantage in sort of a first mover's advantage. And so that first mover's advantage requires some amount of point compensation in favor of white to balance the odds. At a very high levels of play, being able to go first matters a lot.

So Go experts and computer simulations have roughly calculated that for 19 by 19 boards, which is the full game board, as well as smaller boards, this kind of point offset or komi is worth somewhere between 6.5 to 7.5 points. So that's what a standard komi looks like.

**DWARKESH** 0:16:25

Makes sense.

**ERIC** 0:16:26

So at the end, you would count your white stones, your white intersections, I would count my black stones and black intersections, and then you would get 7.5 more points.

**DWARKESH** 0:16:34

Cool.

**ERIC** 0:16:35

Yeah. So that's the rules.

**DWARKESH** 0:16:36

Nice. All right. Now help me crack this with AI.

**ERIC** 0:16:38

Great. Okay. So let's implement a Go bot.

**DWARKESH** 0:16:45

Okay, yeah. Let's understand how AlphaGo actually works and how somebody in the audience might be able to implement it.

**ERIC** 0:16:51

Great, yeah. Again, I started out this knowing nothing about how to play Go, how to implement Go. Interestingly, this is sort of a held-out research environment almost, so there's no... Besides KataGo, there's not a lot of Go implementations out there unlike the rest of machine learning. So in some sense, you're almost testing the coding AIs as to whether they can reproduce an interesting environment that has very little public code bases.

So yeah, let's start with an intuition about the underlying search process used to make moves, and we'll layer on ideas from deep learning to make it much more efficient and tractable. So Go is a game where there's just two players. We're gonna draw a person here, and we're gonna draw an AI here. And let's say this person is playing black, so they go first. So we're gonna draw.

They go here. And then now the AI is going to make a move based on what it sees here. So there's a question of how you encode these inputs into the AI. Maybe you could use ones and zeros, but you wanna represent black, white, and empty. So you would need at least three different values here. So maybe you could use zero, ones, and twos or something. So the AI might see something like, you know, zero, zero, zero, zero.

Great. So this is the input to the AI on its turn. And it's gonna make a move, and to do this, it's going to basically consider many different moves and, you know... So let's say from here, it could choose three possible moves. Maybe it goes here, maybe it goes here, and maybe it goes here. The AI's like, "That's the wrong move."

Okay. The AI can choose, let's just pick three possible random moves that it can go, and I just drew these at random. And so which move is best here? Well, we don't know until the game ends. Go does not have any kind of local reward of which move here is good. And this is what makes Go a very difficult game, is that you don't actually know who won until you really get to the end of the game.

So how deep is this tree? Well, in a 19 by 19 Go board, there are, you know, roughly to the order of 361 moves on any given move. And of course, as it fills up, you have less moves. And the number of steps in the game can be somewhere from 250 to 300 moves. And maybe experts might decide to end the game well before that. But, you know, under Trump-Taylor scoring, you actually have to play things all the way to the end. So this could be like 300 moves or something. So like 300 like depth of the tree.

So if you keep on expanding possible moves here... So in this move the AI is going, and then, you know, here the human would go. And then, you know, there's...

And so forth. You can find that essentially what you end up with is an enormous explosion in the possible game outcomes originating from just this one state. So this is something to the order of, like, 361 to the power of 300, which is far more than the number of atoms in the universe. It's just... And of course, actually there are redundancies and symmetries, so it's not actually 300, but that's sort of the... If you were to do a naive tree where there were no merging of children, then actually you end up with a tree about this big.

**DWARKESH** 0:20:53

What do you mean by merging of children?

**ERIC** 0:20:55

There are, for example... If I choose to play... Actually, let me use this board here. So if we start here...

**DWARKESH** 0:21:03

Is this... We're still recording?

**ERIC** 0:21:04

Yeah. If we start here, and then you play here, and then I play here, and then you play here, that is equivalent to... I start here, you play here, I play here, and then you play here.

**DWARKESH** 0:21:16

Yeah.

**ERIC** 0:21:18

So both of them arrived at the same spot but through different paths, so this child node can be thought about as a shared ancestor.

**DWARKESH** 0:21:25

And I guess it's not 361... It starts at 361, but it decreases by one each time.

**ERIC** 0:21:28

Yes. And the branching factor decreases by one each time. So in any case, this is a very, very, very large tree. And this is also why computer scientists for many years thought that Go was not a tractable problem this century. Because the amount of compute you would need to exhaustively search every possible possibility is just too large. If you could, Go is actually a deterministic game. So on any given state, you can actually compute what the best possible strategy you can make is in order to win the game. You can search all the possible futures where you win and then just make sure you always stay in that set of futures.

So AlphaGo's core conceptual breakthrough was using neural nets to make this search problem tractable. So before we talk about AlphaGo, let's talk a little bit about how you might decide what actions to take. In reinforcement learning literature, pre-neural networks, there's this idea of upper confidence bounds where maybe you don't necessarily know ahead of time what the values of each of these actions are, but you're gonna interactively explore the tree and then back up to establish a sort of mean value for each of these bounds in the tree.

**DWARKESH** 0:22:44

Before we do that, actually, can I ask a conceptual question, which is why, based on how people talk about Go and you watch the AlphaGo documentary, people are just stunned that an AI can do this because this is thought to be a much more creative game, thought to require much more intuition. I know we only did a five by five board, but my intuition is based on a five by five board. Why, I guess cornering pieces doesn't necessarily seem like the kinda thing where I'm like it's crazy... It's not like I'm... It's crazy how an AI could anticipate that this is how you corner a piece. So maybe you can give some intuition for why on a larger board this sort of creative and open-ended nature of the problem really shines through.

**ERIC** 0:23:28

For sure. Just to clarify, I'm not a strong Go player by any means. I'm an amateur, and I learned Go a few months ago. So I might not have as deep insight as maybe a professional Go player. But Go has... In the same way as chess, very brilliant moves in Go where you switch very quickly from losing to winning or you trick a player into winning a battle but losing the war has often a lot of parallels to military strategy. And so the ancient Chinese used Go as almost like a proxy for evaluating someone's intelligence because it was quite related to the art of both macro and micro. And in a similar way, when you play a game like StarCraft, people kind of ascribe some level of creativity and intelligence to being able to manage both micro and macro at the same time. So I think Go is a sort of prehistoric StarCraft analogy where you get to play a war-like game which involves local battles as well as a sort of global war.

Good. Okay. So before we get into, you know, how neural networks are involved, let's talk a little bit about how we can, assuming we had a powerful enough computer, search this this tree to find the best move. In the beginning, you're not gonna build out the whole tree. You're going to... Because storing that tree would be very expensive. Instead, you might do something like interactively figure out which leaves of this tree are worthy of exploring and expanding into the future to see what else is there.

So there are some early algorithms in bandit literature like UCB1, which is not exactly appropriate for a sequential game like Go, but very much inspired the action selection algorithm used in AlphaGo. So UCB1 looks like on every move we're gonna take the best action or the argmax over A that maximizes Q of A, and I'll explain what Q of A is in a moment, plus some sort of exploration bonus.

So on every node we're going to track a few quantities. So let's consider each of these a node. This is the root node where you're making decisions from, and these are the children of the root node. And we're gonna say each node is basically a data structure that stores a visit count of this this node, this child node.

**DWARKESH** 0:26:24

Is it how often the parent visited this node?

**ERIC** 0:26:26

Yes, and we'll call this an act... So one thing that is easy to trip on is if you come from robotics or other kinds of reinforcement learning, is where are the actions? I'm only talking about nodes. Nodes here represent states, and because this is a perfectly deterministic game with no randomness, you can actually just infer the action based on the child.

**DWARKESH** 0:26:46

Oh, yeah.

**ERIC** 0:26:46

So if I go here, that implies an action. And this is the state that we resulted. The LLMs, if you ask to vibe code an MCTS implementation, it'll most likely design the right data structure here. But it's sort of a chef's choice. You can actually rewrite the tree structure however you like. This was what Claude 4.6 wrote for me when I asked it, and it was a very reasonable choice.

So then Q represents the mean action value of this action. And I'll use a subscript A to denote that this corresponds to taking a specific action to get here from the root node. So if we have root, basically taking A gets us to this node here. And then we're going to also store the probability of taking this action.

**DWARKESH** 0:28:28

Again, from the parent.

**ERIC** 0:28:28

From the parent, yes. Like what are the odds that we sample this one? And this will become relevant later. We've talked about a deterministic tree for now, so I'll bring probabilities into this later. And then finally we have a sort of a dictionary of children, which is just, you know, more of these nodes, you know, in a sort of classic link list style reference tree.

So this is the basic data structure to implement a tree. And what we'll do basically is there's a different algorithm that AlphaGo uses, which is called predicted upper confidence with trees. And it's a very similar looking formula, which is that as we try to select the best action, we're going to basically choose the child that maximizes a quantity that looks like your mean action value for taking that child plus some exploration bonus. Let's talk a little bit about this exploration bonus in the UCB case first.

**DWARKESH** 0:29:28

Actually, before you do that, do you wanna write both UCB and PUCT in a separate part of the blackboard?

**ERIC** 0:29:34

Sure, sounds good. I'll just write over it.

**DWARKESH** 0:29:46

Just so it's narratively coherent.

**ERIC** 0:29:48

Sounds good. In AlphaGo, they use a slightly different action selection criteria called PUCT, and it's short for predicted upper confidence with trees. And this is basically, when you select which child to take, you do argmax A of Q of s, a plus a constant.

So the equation forms are actually pretty similar. These are both scoring criteria. You want to argmax this quantity, and you want to argmax this quantity to determine which action to take. So let's break down the intuition of how you select actions here. This is the mean action value, so how good is a given child on average? And if you actually knew the whole tree, then this is all you need to select the best action. You don't really need to do more than that.

But if you're interactively building this tree as you're figuring out what the Q values should be, then what you have to do is occasionally try some other actions, you know, as a sort of explore versus exploit trade-off. So in both UCB and PUCT, there is this term here that basically rewards taking actions that you haven't taken before. So as we mentioned before, each node stores the visit count of taking that specific action. So everything is initialized to zero. And so for a given action, let's just call it action A, initially it's zero. And as N is increasing, if let's say we've already made 10 action selections from that root node, but we haven't picked A yet, then this term actually starts to become quite large for A. And conversely, if we have chosen A 10 times out of 10, then now this term is quite small. And the same thing is actually true here.

**DWARKESH** 0:32:02

Maybe I should, just to make sure I'm understanding it, maybe I can put it in my own words. Let's just focus on UCB. What we're saying here, you can think of it conceptually as two different things, the Q and then this exploration term. And let's just be clear about what Q is. Q is basically saying, hey, once we do these roll-outs... So you're actually running all these simulations, you go down the tree, and then you figure out, okay, if I end up at the terminal value of this tree, do I win this game or not? And then you do this, you average whether I win this game or not across all the leaves of this tree starting from this node. That average, you put in Q.

And so you're saying the Q is basically representing will I win this game or not? What is the probability that I'll win this game starting at this node? That's your sort of exploit. That is like saying I've run these simulations, I think this is a good move or not. And then this other term is saying, have I explored this branch enough yet relative to the other actions I could be exploring, or I have already explored? If I haven't explored this branch yet, maybe I think it has a low score, but I just haven't explored that many leaves down this node in this tree. So I should maybe try this even though the Q, the sort of exploit, is telling me that this is not that valuable. And because LN of N grows slower than N, basically as the... Over time, you will move from the argmax being dominated by this exploration term, which is the second term here, to the argmax being dominated by the Q term, which is like, okay, I've done enough simulations. I'm quite confident that this is the branch to go down.

**ERIC** 0:33:48

Yes, that's right. The motivation for UCB was to come up with an algorithm where if you don't know the payoff of the different actions you can select to begin with, this strategy basically with a given exploration term here, bounds your regret in terms of how wrong you can possibly be. I don't know the proof. I don't also know if this one is proved to have a logarithmically or square root bounded regret or anything. But I think the algorithm was just derived to look something like this, and you can tell that these terms grow a little bit differently, and this is actually just to account for the fact that Go has many more actions in every given move compared to your standard bandit problem.

One small clarification to make is that you talked a little about simulations on probabilities and so forth. We should remember that Go fundamentally is a deterministic game, so where does the notion of probability come from here? If you had a very powerful computer, there is no probabilities. You can just compute the true average of what the mean action value is. So where does the probability come in? Well, it turns out that as in computer Go before AlphaGo, we've always done some sort of Monte Carlo method where we take the expected Q value averaged over a randomly selected tree. And that randomly selected tree is where probabilities come in. So the interpretation of Q is what is the expected action value under the random distribution induced by some random search process?

And so where does the random search process come in? That's where P of action comes in. So if we assume a very naive algorithm where you have a uniform probability of taking any valid action, then this would just be one over the number of valid moves in the setup, and you would be taking this average over this very diffuse tree. And this is a valid integral you can take, but it's very slow because you're gonna consider a lot of trees that have very low value. And it's essentially almost like an important sampling problem where there's only a few actions and paths that can contribute high value, and almost everything else is low value. So this is sort of a tricky problem here.

Okay. So this is the action selection criteria for how you decide which moves to move down. Now, as you move down in tree search, you will eventually run into a node where it's quite clear you've won or lost. At the very end of the game when there are no valid moves to play left under Trump-Taylor scoring, you can decide whether you won or lost. And so this is basically the final return of the whole game. And so the question here is, we can assign a value, U, to a terminal leaf node of the tree, but how do we assign the values for nodes prior to that, the parents?

And it turns out what you simply do is you just take the... Your mean action value is essentially your average... So let's suppose these were leaf nodes. The mean action value of this node, this action here, is just the average of whether you won or lost at the leaf nodes. And correspondingly, you can kind of walk up the chain and say, well, the mean action value of this node, let's call this QB, and this is action B, is just the average of... a weighted average of these ones here.

And the weighted average could be dependent on if you have a different sampling distribution or not, but the basic intuition is that you want to resolve the game where you have a deterministic win or lose, and then you can kind of go backwards. This is called the backup step and assign values to these nodes or actions corresponding to the averaged over the final terminal leaf. If you were to do this without neural networks, it would still be intractable. You would have trouble finding which actions to sample. A lot of the actions would contribute very low value, especially if you're trying to fight your way out of a losing position, and only a few actions give you high value. So the search in practice is still very, very expensive. But the idea is that if you can... Because Go follows a tree structure, you can actually inform a very good estimate of the value of this node based on the values downstream, assuming they're all correct and assuming you've searched deep enough.

**DWARKESH** 0:38:39

Your explanation earlier about the sorts of states where it's obvious to a human who's going to win but it's not obvious to, or deterministically you still have to play it out, actually drew upon the intuition of why the value function both is trainable and why it's necessary in order to be able to learn this game effectively. Maybe it's worth defining value in the first place.

**ERIC** 0:39:03

Sounds good. We talked about this U value being your final resolution of whether you won or lost, and this is a terminal leaf node condition. Now, humans don't play all the way to the edges of the tree, the leaves of the tree. They kind of stop some dozens of moves before, maybe even 100 moves before, in high-level play. So how do they know? You can think about humans as implicitly having a neural network called a value function that basically takes in a board state and then it evaluates P win.

And so the human glances at the board and they know, "I'm probably gonna lose." And they're essentially running a neural network that looks at a board, and implicitly they are amortizing a huge number of possible game play outs and taking that average and then deciding whether the board is winnable or not, and then whether they should concede or keep playing. And this is remarkable. If you think about the beauty of something like this, it's like a neural network in a human can somehow do all of this simulation at a glance and then just know, like, within a few seconds, without actually playing every single game logically, based on crystallized knowledge and experience that they can do this. And so this gives us a hint that in games like Go, there are ways to radically speed up the search process. And this is one of the fundamental intuitions behind why AlphaGo works, is that you can train a value function to look at a board and quickly resolve the game without playing out all of these trees into a very deep search depth.

**DWARKESH** 0:40:48

Yeah, makes sense.

**ERIC** 0:40:49

I will say for the audience, I sort of found for previous episodes when I was prepping and it seemed somewhat relevant to understand how AlphaGo works, I would find it very, very confusing. But it's the kinda thing where once you understand the problem in this way and then you'll build the next few pieces, it is actually much more understandable and it will make a lot of sense. And it's okay to be confused right now, but it's probably simpler to understand by the end of this lecture than you anticipate. I'll just make that note for the audience.

Yeah, great. So the important intuition at a high level, just to step back about where we're going with all this is that classically for games like Go you could build a tree, but we don't have computers powerful enough for that. And estimating the value of every action that you could possibly take is also hard because you don't know until the end of the game. You could take averages by playing them to the end, but that's also hard because you don't know which actions to take to sample these averages. So conceptually there's two problems. There's the breadth of the tree, and then there's the depth of the tree. And AlphaGo gives us a way to basically shrink both of those to be very tractable. That's essentially the core idea behind it.

**DWARKESH** 0:42:04

And it is interesting because, like, in some sense thinking, reasoning, et cetera, are also problems that have... maybe I'll save that for later.

**ERIC** 0:42:14

Great. Okay. So we take this idea that humans can glance at a board and instantly predict whether we win, and maybe that gives us the opportunity to really truncate how deep we search. And then we also know that humans can look at a board and decide what moves might be good on the Go board. So these are two things that we can use deep neural networks for to accelerate this search process.

Let's go back before we talk about neural nets, let's just go back to how this playout works. We've only talked about making one move. So the AI looks at this encoded Go board. It has a tree. It searches for, you know, deeply into the tree to find out which of its actions might be the best, and then it takes that action, and then it goes back to the human. So maybe now the human sees a Go board that looks like this. And then they make their move, so maybe they put their stone here.

And then now we go back to the AI, which now looks at a new encoded board. So I've used two to denote the AI playing as white, and one to denote the human playing as black, and zero as empty. And then now on the AI's turn, it does the MCTS tree search all over again from scratch. So it throws away this old tree that it searched last round, and now there's a new root node and it begins to search anew.

And then so on and so forth. So MCTS is basically... You can think about it like a search algorithm that is deciding what moves to play best, aided by neural networks. And it's done on every move.

**DWARKESH** 0:44:14

Okay.

**ERIC** 0:44:14

Great. So let's talk about the neural network part of this.

**DWARKESH** 0:44:20

And while you're erasing, another sort of thing that was important for me to understand was this MCTS data structure with nodes and childrens of nodes and whatever, this is done per move and reinstantiated once a move is made. So a human makes a move, then the AI looks at this and is trying to basically run a bunch of simulations to figure out what move should I make next? And those simulations... a simulation is basically like exploring one more node in this MCTS tree. And at the end, once all these... you know, you run 1,000 simulations, that informs then this, as you will explain, this probability of what move to make next. That's what you store. You choose the best move given those probabilities. You discard all of that, then the next player makes a move, and you restart this process at the beginning of every move.

**ERIC** 0:45:16

Correct. One small addendum. You don't discard all of that. You keep one thing behind that we'll use later.

**DWARKESH** 0:45:51

It's helpful to have just like literally two days ago learned this. You know, like, you just like know what... "Oh, that's the thing I was confused on."

**ERIC** 0:45:57

Yeah. And then I guess for you it's been...

**DWARKESH** 0:45:59

Months but...

**ERIC** 0:46:01

You know, to be honest, I do feel like a student myself. So I would think about this almost like a student teaching other students and we're preparing for an exam rather than like a professor or something.

**DWARKESH** 0:46:10

I said you're a research scientist and I'm a podcaster, but-

**ERIC** 0:46:13

Okay. So now we have a basic intuition of how moves are made with search. We're going to talk about how neural networks can speed this up by providing an analog to the human intuition. So there's two networks. There is the value network, which takes in a state and it predicts, are you gonna win or lose? It's a binary classification problem.

Then we're gonna have a policy network which induces a distribution over good actions to take. I'm going to draw a one-dimensional flattened move distribution, but this is really a square grid. So maybe it thinks actions are like... These are the kind of probability distribution over good actions. And both of these are categorical classification problems. So you can train this like any classifier in deep learning with cross-entropy loss, that kind of stuff.

So the specific architecture does not actually matter too much. I tried a few different architectures. Transformers work, ResNets work. For small data regimes, my experience is that ResNets still outperform transformers and give you more bang for the buck at lower budgets. But this may not be true...

**DWARKESH** 0:47:31

Why is that?

**ERIC** 0:47:33

They provide the inductive bias of like local convolutions. And generally transformers start to outperform residual convolutional networks when you want more global context.

**DWARKESH** 0:47:42

I see.

**ERIC** 0:47:43

So one interesting finding from the KataGo paper was that they found it actually quite useful to pull together global features together, at aggregate global features, like throughout the network, to kind of give the network a global sense of how to connect value from one side of the board to another side of the board.

**DWARKESH** 0:48:02

What does it mean to aggregate global features?

**ERIC** 0:48:03

If you have a very large 19 by 19 Go board and you've got some battles going on here and then you got some battles going on here, when you pass this through a convolutional neural network, the receptive fields of the convolutional network are going to be good at computing local things and making that invariant. But they won't be able to easily connect these two features, right? They need to sort of be pulled together and attend to each other somehow.

So the argument about why transformers are good for computer vision tasks, like with vision transformers and so forth, is that because they have global attention across the whole thing, they can more easily draw these connections. But you do need more data there so that you can kind of learn through data the invariant local features. I've tried very hard to make transformers work for this problem because I was kind of curious if transformers would present some sort of breakthrough in Go and just remove a lot of those tricks. But try as I might, I actually haven't figured out a way to make transformers better than ResNets for now.

**DWARKESH** 0:49:11

One more tangential question. It makes sense why transformers with their global pooling of information would be better if you need to consider information that is not just spatially... CNNs give you a sort of bias that the things that are next to you are especially relevant.

**ERIC** 0:49:32

And then they're sort of aggregating up slowly.

**DWARKESH** 0:49:33

Yes. How about the temporal dimension where right now we're only considering the previous move because it is a deterministic full information game where, but what if it was something like poker or diplomacy where really a bluff they made a while back is sort of relevant to understanding now and isolating to decide to make your next move and so you need to consider all those previous states. Would that then change the consideration of what inductive biases are most relevant and which architectures are most relevant?

**ERIC** 0:50:13

Great question. So Go is a perfect information game. And in perfect information games, there does exist a Nash equilibrium strategy for which you can do no worse than any other strategy. So if you know that your opponent has a particular bias, like they love to play aggressively, you can in principle counter that specific strategy better than a Nash equilibrium policy. But to counter any given strategy, there does exist a single Nash equilibrium that can be decided solely using the current state.

So AlphaGo chose to do this, which in hindsight turned out to work very well because the Nash equilibrium seems to be superhuman. No human strategy seems to be able to beat it. Now, there are variations of this where you would actually need to consider temporal history. And this is a very exciting research area that I would encourage people to fork my repo and try these things out, which is if you were to play, let's say, 2v2 Go, then you actually need to model your partner's behavior and you may not have information on how they play. So you need to aggregate some information on how they play so that you can respond accordingly. Like these are situations where it's no longer a perfect information game, and then in those cases, in games of imperfect information or partial observability, then you do need some context to build a model. And I think that's a place where things could get very, very exciting in terms of self-play or diplomacy-style.

**DWARKESH** 0:51:46

Yeah, interesting.

**ERIC** 0:51:47

Okay. So returning back to the neural network, the architecture again is not super important. You can get it to work with transformers, you can get it to work with ResNets. I found that for low-budget experiments, ResNets work a little better. You can also use kind of Karpathy-style auto-research, hyperparameter tuning to make your architecture pretty good. And so you don't have to worry too much about that. You just need to sort of set up the problem so that you have a sort of target optimization goal.

Okay. So we're going to pick just a somewhat arbitrary architecture that worked for what I did, but again, this part is not super important. You have your encoded board state, and we're going to just choose to, let's say, do three... like similar to an RGB, we're gonna have three channels. One channel to encode black, one channel to encode white, and then one channel maybe to encode empties or maybe a masked region if you want to train on multiple board sizes. I'm actually not going to talk about multiple board sizes for now, that's a little bit too complicated. So we'll just say we've got this two or three channel RGB-like image. And then we go into a ResNet, and then we have two branching heads. One head predicts the value function, and this is like a single logit.

And then we have the policy, which is 361\. So this is the architecture. And we're going to basically train this to predict the outcomes of games given the board state, and we're also going to train this to predict what are good moves. So the OG AlphaGo paper, or called AlphaGo Lee, initialized this network with a supervised learning data set of expert human play. Later they removed this restriction by having the model teach itself how to play well, but I find it actually, from a matter of implementation for your audience, super nice to always kind of initialize your experiments to something that's easy and then get the problem working before trying to bite off the whole thing and learn it tabula rasa.

You generally want to initialize... Just as in deep learning, initializations everything. You always want to initialize your research project to something as close to success as possible, especially if you're doing something new that you haven't done before. Always pick something that works and then get it to do something better rather than start from something that doesn't work at all and then try to make it work.

So under that philosophy, it's a great idea to start from something that has a good initialization. So we're gonna take human expert plays and train this model to predict good actions. So we're gonna take all of the winning games, all the moves in which a human won, and predict those actions. And then, regardless of board state, whether you won or lost, you're going to predict the outcome. You might be wondering, okay, well, some of the early boards, you know, where basically only one stone has been put down, how could you possibly know whether... who who the winner of this game is? Well, if you have hundreds of thousands of games, then on average you'll probably see that boards that start like this have... Half of the games that branch off from this will win and half of the games that branch off from this will lose. So that'll actually be fine. When you train this model to predict those, the logit will sort of converge to 0.5. And so for these things, it's sort of expected that once you train the model, a starting board state will look like 0.5, and then as you progress towards the end of the game, it'll actually look something like... if this is 0.5, the win probability will sort of either go like this or it'll go like this.

And as you get hundreds of steps into the game, it becomes much more clear who's more likely to win or who's more likely to lose under your expert data distribution. Okay. So you've initialized this model to predict both of these things. And so now we can apply this to the search algorithm.

**DWARKESH** 0:56:01

Sorry, can you just read this sentence for me?

**ERIC** 0:56:03

Okay, so at the beginning of our Monte Carlo tree search, our tree is very basic and only has the root node or our current board that our AI wants to play at. And so we are going to basically select the best action for this. So we, we start with, we start with just... Sorry, let me back up. Okay.

So at the beginning of our Monte Carlo tree search, we have our root node, and we can initialize it with some children, right? Because we know it's, uh, the, the policy network evaluated on the root node gives us on a 3x3 board with one existing stone placed, eight possible children that this AI could take. So with each of the children, the policy network also gives us the probability of selecting that child.

So the first step is to do the selection of the tree. And again, this is a very shallow tree. All we have so far is a tree of depth one essentially. So our first move is to select by maximizing or argmaxing the PUCT criteria, which is basically, you know, Q, S, A plus C PUCT times P of A divided by n over 1 \+ NA. For each of these, we're going to, uh, you know, NA is zero for all of the actions initially. N is zero. And, um, and so we're going to basically just, you know, pick according to this. Um, initially, what is going to be the chosen action here is most likely going to be biased towards, um, you know, the highest likelihood action here, right? Because these are sort of uniform for everybody. So let's suppose P1 was the highest probability node. So you, you, you selected this one here. Now, you got to this node and you realized that it's not a leaf node, right? There are more... It's not a terminal game, so you cannot resolve the final resolution. So the next step that you do is expansion.

So you will then run this node, this board state through the policy network. Note that this is the AI's move, right? AI is making this move. And so when we expand this tree, we're now thinking about what the human might do or any opponent might do. So this is like your opponent. The tree expansion process actually is completely... So when we evaluate the, um, the node here, we're going to now evaluate the node from the perspective of this player.

So then this one has possible actions that we could take, and, uh, we, we expand basically the, the, the leaf nodes here. So for each of these nodes that we could, you know, arrive at, we're going to now check how good those nodes are, right? So, so maybe, um, from here, the human could play here, the human could play here, or the human could play here. And we're going to, um, store essentially V-theta for each of these things. So V-theta of, you know, node one, or like node one prime, V-theta node one prime, V-theta. And so we're basically using our neural network to make an intuitive guess of how good is this board from the perspective of this player. And, uh, fortunately, because the, it's a zero-sum game, it's easy to deduce that the value for this player at this step is just 1 minus the value for, from this perspective. So it's easy to flip the search process depending on which player you're at.

Um, and so, so this is the expansion step. You've taken a non-leaf node and expanded it and evaluated the value. And this is essentially a quick guess as to, like, if I were to play to the end, am I going to win or not? So you can almost think about the V-theta as a shortcut for searching to the end of the tree for any given simulation.

Um, and then we're... And this is, this is essentially the evaluation step, where we're evaluating the quality of each of these boards. In original AlphaGo Lee, they actually did something kind of interesting, which is that they took this value and they averaged it with the value of a real Go playout. So they actually played a real game from here all the way to the end. So I'm just going to draw this squiggly line to indicate some path. And, uh, they kind of, like, played this all the way to the Tromp-Taylor resolution of a full board. And so this is like a zero or one, right?

And so they took this value and they just averaged it with this one here. So the, the formula they did was like, uh, you know, alpha times V-theta of, of, like, you know, some node, um, plus, uh, sort of, like, 1 minus alpha of a, of a true randomly sampled playout.

And you might be wondering, like, okay, well, how do they play this out, right? Like, it would be very, very costly to do another search on this playout, like almost like a tree within a tree. So they don't do this. Instead, they just take the policy network and play it against itself. So they just take this as both players and they just play it all the way to the end. And, and, um, this is something that helps ground the, um, the estimates here in reality, because you can get a single sample estimate of, like, whether you win or not. You can think about in the end game where the board is almost resolved, that this one actually becomes quite useful because the random... the play according to the policy will most likely decide a pretty reasonable guess of the game. And so you're not, you know, facing a problem where this one kind of becomes untethered from reality. It turns out this is totally unnecessary. So in all subsequent papers after AlphaGo Lee, they just got rid of this. And so in my implementation, I also did the same, and it speeds things up a lot because you don't have to roll these games out on every single simulation.

**DWARKESH** 1:00:19

So, and this is what AlphaGo Lee did.

**ERIC** 1:00:20

Yeah, so this is what allows you to kind of, um, you know, you can do this kind of, like, um... Uh, you can try to... Yeah. So, so the, the beautiful thing about AlphaGo is that it never has to deal with this problem.

**DWARKESH** 1:00:41

Oh, yeah. Okay, sorry. Yeah. Um, anyways, so earlier I was sort of stumbling around, this intuitively, why is this ability to do iterative search where you don't necessarily need to be able to win the game in the beginning, you just need to be able to improve your current policy. Why is that so powerful a capability in learning as compared to how LLMs currently learn RL?

And, um, and yeah, it's exactly this thing of... This is assuming that you're... This is considering your pass rate of the entire trajectory. Actually, I don't know a formal way to think about this. Maybe you should help me out here where... but, like, yeah, the-

**ERIC** 1:02:31

Why, why is AlphaGo an elegant RL algorithm? So, um, uh, the major reason is that you never have to initialize at a 0% success rate and solve the exploration problem of how to get a non-zero success rate. And this is what allows you to hill climb this beautiful supervised learning signal where... And if you look at the actual implementation of AlphaGo, um, every step of the way, there's no, uh, there's actually no, um, you know, TD error learning or dynamic programming, at least explicitly. Um, it's just supervised learning on a value classification, as well as a policy, uh, you know, KL minimization. So it's just a supervisor learning problem on improved labels. And so the training is very stable. You can train as big of a network as you want. You can kind of retrain this on the data set. Everything will just go stably. The infrastructure is very simple to implement as well. You don't need a distributed... a complex distributed system to kind of keep everything on policy. At the end of the day, you're just saying, like, "I have some improved labels. Let's retrain my supervised model on these targets." And so you're always in this beautiful regime where you're just trying to improve the policy rather than escape this kind of, like, uh, sort of local minima where everything... every signal is flat all around you.

So if you draw the sort of win rate of an MCTS policy versus the raw network... So let's say this is the dotted line is the raw network. The MCTS policy kind of looks like this. And so every step of the way, this supervision signal is very clean. You're never in a situation where, you know, the MCTS is kind of like giving you no signal. Unless your MCTS distribution converges to exactly what your policy network predicts.

**DWARKESH** 1:04:12

Yeah, yeah, yeah. Okay. That, that's, that's a great way to explain it. Um-

**ERIC** 1:05:01

Okay, so we now talk about the RL part of, like, how this thing gets stronger by playing itself. Um, let's say we play a game where the AI... So you make a move, AI will kind of compute the search, and then this is the sort of visit count distribution. Let's say this is your policy, your initial policy recommendation at the, at the, at this node. And then after MCTS, it, uh, gets more confident about one of these actions. And so the distribution looks a bit more peaky like this, based on the search.

Now, of course, you can tune the search process so that it ends up more diffuse, but that's probably not a good idea. MCTS should get more confident about specific actions than others. But it, of course, might place a lot of weight on, you know, other actions initially and then as you increase the number of sims, it should converge to a very peaky distribution.

So this is your new, let's call this like pi... Let's wrap this in like an MCTS operator of A given S. So after applying MCTS process, your policy recommended distribution looks like this. It's a bit more peaky than the previous one. Um, and then you take the argmax or maybe you just sample from this. It doesn't have to be the argmax and then you make your move. And then, and then you throw away the tree and then you begin anew on the next move.

Again, you, um, you compute a new distribution, and then you refine it through MCTS. So on every move, you have your initial guess from your policy network. And then the search process that combines your policy network and your value network arrives at a more confident action that you take. And then so on and so forth. And then the game ends, and one person wins and one person loses.

So a, the way that, the beauty of how AlphaGo trains itself is that it actually can take this final search process, the outcome of the search process, and tell the policy network, "Hey, like, you know, instead of having MCTS do all this legwork to arrive here, why don't you just predict that from the get-go?" Like, "Why don't you, like, not use this guess and just predict this to begin with?" And if you have this guess to begin with in your policy network, then MCTS has to do a lot less work to get things to work. And so if we draw, like, a sort of test time scaling plot, so let's say this is, like, number of simulations. Um, let's say, you know, at zero simulations, your your sort of implicit win rate is like, um, is like here, and then, and then, um, and so, if you search for, let's say, 1,000 sim steps, that gets you to a, um, a policy here that gets you to here, which is great. But if you were to distill this MCTS policy network back into your sort of shoot from the hip policy network, then you could actually, um, uh, you know, start here, like, uh, if let's say this was, you know, zero, uh, by distillation, then if you spend another 1,000 sim steps, then you actually kind of get to here. It's almost like if you could just, you know, amortize this, the first 1,000 steps actually into the policy network instead of the search process, then you could begin at a much better starting point and then get a much better result for your, uh, for the number of sims that you put in.

**DWARKESH** 1:08:06

The safe-mo-type nature of test time scaling, as the number of simulations increases the increase in win rate is smaller. Is that true even for the distilled network? That is to say, is there some gain of, like, okay, we start from the distilled, we get these early gains again, or is that just inherent to, like, the nature of MCTS?

**ERIC** 1:08:23

Yeah. To be honest, I actually don't know the test time scaling behavior of MCTS simulations. And I, I believe it might actually be quite sensitive to how strong this one is in practice. I'm just drawing a monotonically increasing function that gets to one. So don't pay too much attention to the shape of the curve, just know that it's monotonic with respect to search.

So the idea of MCTS is very brilliant, which is like, we're going to... We got something better by applying search, and, um, we're going to now on our next iteration of updating this network, just train this to approximate the outcome of 1,000 steps of search. And so instead of starting here, we get to now have a neural network start here, and then, and then, you know, the, the, the play gets stronger once we then apply another 1,000 steps on top of it. And you can keep going. So the training algorithm for AlphaGo is to basically take the games where you've applied this search on every move that the policy encountered, whether you won or lost. And that's quite important. And you're just going to train the model to imitate the search process.

So there's an analogy to robotics actually, which is the dagger algorithm. First, I'm going to draw out like a schematic of, like, let's say, you know, the states, right? So S0, S1, S2, S3. So let's say, you know, we, we took a series of actions in an MDP to get a trajectory. And these actions may be suboptimal, right? Maybe we lost at the end of this game. So there is a family of algorithms that basically take trajectories and relabel the actions to better trajectories. So maybe a better action here would have been to take, you know, A0 prime. A better action here would have been to take A1 prime, yet another one like A2 prime, A3 prime.

So the... What MCTS is doing is basically saying, "You played this game where you eventually lost, but on every single action, I'm gonna give you a strictly better action that you should take instead." It does not guarantee that you are going to win, but it does guarantee that if you take these tuples as training data so that you retrain your your policy network to predict these ones instead of these ones, you're gonna do better. And this is very related to dagger in robotics and imitation learning where you want to collect an intervention here, and even if you're in a, in a not great state, for example, like a self-driving car that, you know, veers off the side of the road, there is still a valid action that kind of corrects you and brings you back.

**DWARKESH** 1:12:03

Okay, so... Pedantic question. But is there a guarantee that MCTS must be better than the policy? For example, you could imagine early on in training because MCTS is informed by the value network, early on in training, uh, when the value network hasn't been well-trained on finished games, um, that MCTS is worse than sort of randomly initialized policy. So is it just like a heuristic that MCTS is better than the policy or is that like some guarantee?

**ERIC** 1:12:31

Right. Uh, it is in practice, it is a heuristic, um, and it does work in practice, but let me illustrate an example where MCTS can give you a worse distribution than your policy network. So, um, and this can often happen if your self-play algorithm has trained to a good point, but then somehow it, it collapses because it's, um, it's not trained on diverse data or something. So, um, let's say we have a board state where the policy recommendations here are very good. So, so like pi of AS is like great. But, um, somehow because maybe we're playing on a lot of games where the bots just resign instead of playing all the way to the Tromp-Taylor resolution, they kind of forget, um, how to evaluate those kind of late stage playouts, right? Like in the, in the case that we showed with the corner play, maybe, like, 100% of our training data in our replay buffer has lost examples of how to evaluate the value function at those states. So you might end up in a scenario where your terminal value, um, is like very bad. Um, and so the, um, if the terminal values of the leaves are not good, then this will actually propagate all the way up and cause your, um, your PUCT selection criteria and your backups to be off. And then you'll end up visiting a very, very different distribution than what your policy initially recommended. Also, if your number of sims is low, then you might also have a variance issue where you just don't explore enough. Like, it's only guaranteed to converge when you kind of take N to infinity. Um, so variance in, you know, your search process, as well as inaccuracies in your evaluation, can definitely screw with the quality of your policy recommendation. And so that's why it's not a guarantee to improve. But, and, and that is why I think, I suspect why AlphaGo Lee had the playouts to the end in their training algorithm so they could ground this thing in real playouts.

**DWARKESH** 1:14:26

Yeah.

**ERIC** 1:14:27

Um, in practice, what you could also do is just, like, for 10% of the games, you prevent the bots from resigning and you just say, "Resolve it to the end." So you get some training data in your replay buffer to really resolve those kind of, like, late stage playouts that normal human players would, would kind of, uh, not play to.

**DWARKESH** 1:14:44

Yeah, yeah.

**ERIC** 1:14:44

So, um, so this is why MCTS kind of... If you assume that the value functions are correct, why it gives you a better policy is because, assuming... And it's a very critical chain of assumptions. Assuming that this is accurate, then your search process should give you a better recommendation than your initial guess.

**DWARKESH** 1:15:02

Right. Okay. So, to just understand, if you have a cold-started policy, if you have an AlphaZero type thing, really what's happening for the first few epochs is the policy is kind of useless and what you're really just doing is, "Hey, let's play full games and once we have played full games, for the preceding moves, we'll have labeled who won, who didn't win." And the loss for AlphaZero has two components, which is, like, how good is the policy relative to MCTS, and how good is the value prediction relative to who actually won the game from this move. And this is... this sort of, like, you can think of this being applied to every single action or every single move.

SPEAKER C 1:15:42

Correct.

**DWARKESH** 1:15:42

And really what's happening in the beginning of AlphaZero training is just, like, we're trying to get the value function to actually predict who will win the game if you're, if you find yourself in this state and you're this player. And then functionally that's all that's happening and later on, once that's well-trained, now the policy is also improving.

**ERIC** 1:16:00

Correct. One trick I did find to be pretty useful, and this is not a peer-reviewed claim, so just, like, take this with a grain of salt is, like, I, I found it useful in my own implementation to do the, do the following. Um, you wanna first make sure that this is good before you invest a lot of cycles doing MCTS, right? Like, like, it doesn't really make a lot of sense to do search on garbage value predictions. Um, so you wanna kind of start at a good place where this works.

AlphaGo Lee does a very good thing where it just takes human games and then you, you, like, uh, train on it and then it just works, right? Totally works. Uh, you can also take an open source Go bot, play it against itself, um, generate data, also works. Uh, so if you have some, like, offline data set that, um, that, uh, has realistic, good play, you can easily learn the late stage, um, value functions pretty well. And that's the, that's what you kind of need to start the search process.

**DWARKESH** 1:16:50

Sorry, I can you just repeat this sentence one more time?

**ERIC** 1:16:51

So it's quite easy to evaluate a late stage Go game. Like, when almost all the pieces are on the board, like, it's almost, like, a decidable problem, right? Because there's a lower uncertainty as to, like, the depth of the tree. So most games played to the end by reasonable people, um, will be good training data to train a good value function at terminal parts of the tree.

**DWARKESH** 1:17:11

Got it. Okay.

**ERIC** 1:17:12

Then as you play more games, the, um, the search will back up good values into the, the sort of intermediate nodes of the tree. And then, like, as you increase the amount of data, your, your model, your value head gets a good intuition of, like, what is a healthy board state versus a not-healthy board state.

**DWARKESH** 1:17:28

Yeah.

**ERIC** 1:17:28

That, that those are much more subtle to judge in the mid-game than the beginning or the end. So the, the most difficult part to score is, like, not the beginning or the end because the beginning is just, like, obviously 0.5, and then at the end it's, like, pretty obvious who's winning. So the hard part that you wanna learn in the value function is, like, who's winning in the middle.

**DWARKESH** 1:17:44

And so this, this is actually very analogous to TD learning.

**ERIC** 1:17:46

Yes, and there's a beautiful connection to TD learning that we can, you know, talk about in a bit, uh, as opposed to, you know, contrasting with Monte Carlo search. So, um, if you just do this... So imagine, you know, you're vibe coding AlphaGo and you, um, you, you gather some expert data sets from, like, KataGo online, um, or you, you know, you have a data set of human players and you train this model. Actually, it turns out this model is already a pretty good Go player. It'll most likely beat most human players, right? So if you just take this policy recommendation and take the argmax over, you know, it's uh- if this is the, you know, probabilities, if you take the argmax and you just take this action as your Go play, um, it'll be a very, very fast Go player that doesn't think in terms of, like, reasoning steps. It just kind of shoots from the hip and it'll be a very strong Go player, which is already quite miraculous if you think about, like, you know, 10 neural network layers, maybe under, like, three million parameters, can already do something that impressive.

And so you can start this way, and it's important when implementing this to kind of just verify that this is probably true. It's good to verify that your Go rules are implemented correctly, that, like, you know, you can run these simulations relatively quickly, and it's almost, like, a sort of a check point that, like, you wanna make sure that you can actually do this basic step before you try to layer on more complex things, like search. But we can do a lot better than taking the raw neural network and playing the moves. And this is how we can apply it to Monte Carlo tree search.

Okay, so let's talk a bit about, like, you know, is MCTS the only self-play algorithm that we could do? Could we do other things, like maybe something that looks a little bit more like how modern LLM RL works? And let me start by with a a bug that I had in my code for quite some number of weeks. And this arose from my conceptual misunderstanding about how MCTS was supposed to be relabeling actions for the moves that you took instead of a more naive self-play algorithm where you just reinforce the winner.

So when I started implementing this, I would apply MCTS, it would boost the performance of the policy, and then I would take the winning trajectories and try to distill that back into the policy network. So it's like, do more of what won, do less of what... like, don't imitate what didn't win. And this is a, this is actually a reasonable algorithm that you could do. But here's the problem. So let's say I have a strong baseline policy B, and I'm doing something very, uh, you know, simple, which is I'm playing against policy B as a sort of fixed opponent and then trying to increase my performance against it. So I pick KataGo as a baseline and I'm training my model against it and applying MCTS and taking the winner. So for example, sometimes I would take the winning KataGo moves and then, uh, you know, use that as supervision for my model. And so what happened was you basically have something where your performance climbs up to about 50%, and then it cannot surpass that. And I was stuck for a long time trying to figure out, like, why is it not able to self-play itself to surpass, you know, my baseline, KataGo?

And this is, this is kind of the mechanics of what's going on when you do it this way. If you're trying to just, you know, naively, uh, supervise your policy network to match the winning moves. So, um, let's suppose you have two models that are evenly matched, so they have a true win rate of 50%. You play 100 games, and each game takes, like, 300 moves to resolve. And let's say, you know, through random chance you have 51 wins from policy A, your current policy, and then 49 from your baseline. And just to have a very simple model of how it managed to win, let's say that, you know, for 50 games, they played very, very sim... or sorry, for 49 games, they played very, very similarly, identically, and the policies that they, they, the actions that they took are no better than the current true policy outcomes. So if you were to train on those labels, they would basically not change any of your behavior, right? So let's call those, like, neutral labels where it's, like, retraining on it just doesn't change your policy. It's kind of converged.

Um, so the number of neutral labels you have is basically 49 times 300\. And let's say in the one game that we did win, there was just one decisive move that kind of, like, happened to be better than average, and so that's what gave us that one win. So there's basically one move that you made, out of all the moves that you made, that between both players, that, uh, gave you a good label. And for neutral labels, there are... Well, essentially 99 games that you played on both sides, plus 299 average quality moves here.

So you have one label of good supervision. You don't know where it came from in this set of moves. It's just like one move happened to be better. And the rest of the labels were, you know, performing exactly as expected. So when you retrain the model on this set of data, this one good signal is going to be drowned out by the supervision of all of this signal.

**DWARKESH** 1:18:27

I guess, but you do know it's within the one game you won, right?

**ERIC** 1:18:31

Well, you just know that you won 51 games, but which, which of... Of the 51 games you played, which one did it play an unexpectedly better move? And which move was it?

**DWARKESH** 1:18:41

Right.

**ERIC** 1:18:41

Or in fact, you don't even know that. To the extent that there you just know there's a good move. You just, you don't know that. Um...

**DWARKESH** 1:18:48

Yeah, what... But shouldn't it be then 51 here in the neutral labels? It's rather than 99?

**ERIC** 1:18:51

So every game has a winning player, right? So you are supervising, like... there's 99 games where there were, like... I it doesn't matter which player won, and they just play the same. So one of the players won, so you just take their moves of that. And I, I, I sorry, I should change... The 300 should actually be 150\.

So, so like, yeah, there are 99 games where things were played normally, and then of those, the winning player had, like, half the moves. Yeah. And then, um, of the game that you did win in a special way, there were 150 moves that you took. Yeah. But the problem is, like, which game of the 100 did you do a special move on? And then of the 300 time steps, which move was it? And so this is the essence of the credit assignment problem in RL. When you have an accidental success, the core problem of long horizon RL is figuring out, um, uh, both on the sort of random sample noise of a given environment, as well as the, um, random, like, noise within, uh, within the episode. Yeah.

So the gradient for your supervision objective where you're trying to clone this thing, the issue is that for one, the signal from here really drowns out the signal from here. So even if this was a good example, it's going to be, like, overweighted by far by all these other terms here. And secondly, we've determined an indicator function where we're training on the successes and, uh, just not training on the failures. So essentially this is one if you won and zero otherwise.

However, you want to know if the action you took was not just whether you won, but you actually want to weigh... The right thing to do is to only upweight it if it is much better than what you would normally do.

**DWARKESH** 1:21:33

Yeah.

**ERIC** 1:21:34

And this connects to the notion of advantage in RL, which is actually very common in LLMs. So when you do something like this, you actually have a... There's two terms that really blow up the variance of your gradients. And high variance just means there's no signal. So, um, when you look at the variance of this, there's a term here that grows, and then there's actually... Because the actions are coupled to each other through time, decided by the same policy, there is a term that shows up in the variance that's dependent on T squared.

So the longer your episode is, the more noise there is in the credit attribution process for which action was actually helpful. And that's sort of the essence of what...

**DWARKESH** 1:22:13

And the variance grows as T squared?

**ERIC** 1:22:13

Correct. Yes.

**DWARKESH** 1:22:15

Interesting. So if you, if you write down, like, you know, var GL, equals expectation of... And just for simplicity, we can pretend this is, like, on average zero or something. If we're just centering it at, you know, no signal. And the variance here basically means that you're, you know, taking the square of this product term, and so you end up with, uh, you know, a term that kind of grows quadratically with the, with T.

So the variance actually grows as a function of T.

**ERIC** 1:22:45

Sorry. Uh, I think I, I... Yeah. I should just say like, yeah, the, the, the, the variance of the gradient, um, does scale with T squared.

**DWARKESH** 1:22:50

The reinforce thing you just illustrated, at least, like, a descendant of that algorithm is at least as of public knowledge, how LLMs are trained to do RL.

**ERIC** 1:23:01

Yes. And the reason why LLMs don't have this quadratic T problem is that they don't, even though in an autoregressive token sequence you're decoding many, many tokens, they don't treat these as sequential steps. They treat it as a single step. So you're actually only taking... T is one essentially in a LLM RL environment.

**DWARKESH** 1:23:20

Wait, I'm not sure I understood that. Why?

**ERIC** 1:23:21

So, um, if you think of an LLM like you're decoding a sequence of tokens. How many actions is this? LLM RL setups actually treat this as one action.

**DWARKESH** 1:23:39

But you're, um, you'd update the model on all of the intermediate tokens in that trajectory, right?

**ERIC** 1:23:49

The model would care... So action here is the entire decoded sentence. This is your prompt, and T is one.

**DWARKESH** 1:24:06

Is this just a semantic thing?

**ERIC** 1:24:08

No. It's a very important implementation detail of LLMs where you don't want to treat the, um, the computation process as having to do backprop through, like, sequential token decoding. You want to just treat the whole thing as one action, and then you score it based on the quality of that one action.

**DWARKESH** 1:24:28

What would it even mean for them to be different actions? How, how would you, how would you implement them being different actions?

**ERIC** 1:24:35

You can compute a per-token log prob, and then have your final gradient be the final return times the sum of things here. And when you take the, yeah, when you take the variance of this, it's actually much larger than the direct variance of, um... Actually, sorry. Sorry. Let me back up. I'm actually not confident in what I just said.

**DWARKESH** 1:25:01

Call it, if you want.

**ERIC** 1:25:05

Yeah, let's, let's let me search it up.

Okay. So let's apply the neural network to, um, to improve Monte Carlo tree search. So we start with our root node, and we now have a four-step iterative process to do MCTS. So this tripped me up when I was first reading the paper and trying to understand it, but, uh, essentially what we're going to do is we're going to choose a number of simulations. So like num simulations. And this number varies. This can be, you know, somewhere between 200 to 2048\. I believe in, um, in the AlphaGo Lee match, they used tens of thousands of simulations per move because they really wanted to boost the strength of the model as much as possible.

**DWARKESH** 1:30:27

Yeah.

**ERIC** 1:30:28

But in training you don't actually need that many. And KataGo, I think, uses something on this order as well.

**DWARKESH** 1:30:33

Do you know if they used... If you watched the documentary, they had a laptop out during the game.

**ERIC** 1:30:36

Yeah.

**DWARKESH** 1:30:37

They didn't use a laptop itself. It was, like, on some-

**ERIC** 1:30:39

It was on some TPU pod, I think. Yeah. But now...

**DWARKESH** 1:30:42

That kind of unfair.

**ERIC** 1:30:44

Well, uh-

**DWARKESH** 1:30:45

Like Lee is not using, like, 1E22 flops to do a move, you know.

**ERIC** 1:30:49

Fair enough. Um, interestingly enough, modern Go bots don't need that much compute at test time. And what we'll actually find out as we talk about how the, um, MCTS policy improvement works is that over time, the raw network actually takes all of the burden of that big TPU pod and just pushes it into the network. And you can do all of that work with one neural network for pass. Um, but the TPU pod will always add the extra oomph on top, and so that's what they wanted for the match. Um, so we're going to pick this kind of, like, num simulations thing, and, uh, for every simulation, we're going to basically do several things simultaneously.

We're going to see what moves are the best in the current tree. We're going to add extra leaves to the tree if we get to a point where we need to add a leaf, and we're going to update the action values for the tree. So that's what every simulation involves these kind of, like, four-step process. So the four-step process is basically selection, expansion, evaluation, and backup.

So on our first simulation, all we have in the tree is the root node. We're going to, uh, and the root node, as I mentioned before, has the key data structure elements. It's got, um... We start with just... Sorry, let me back up. Okay.

So at the beginning of our Monte Carlo tree search, we have our root node, and we can initialize it with some children, right? Because we know it's the policy network evaluated on the root node gives us on a 3x3 board with one existing stone placed, eight possible children that this AI could take. So with each of the children, the policy network also gives us the probability of selecting that child.

So the first step is to do the selection of the tree. And again, this is a very shallow tree. All we have so far is a tree of depth one essentially. So our first move is to select by maximizing or argmaxing the PUCT criteria, which is basically, you know, Q, S, A plus C PUCT times P of A divided by n over 1 \+ NA. For each of these, we're going to, uh, you know, NA is zero for all of the actions initially. N is zero. And, um, and so we're going to basically just, you know, pick according to this. Um, initially, what is going to be the chosen action here is most likely going to be biased towards, um, you know, the highest likelihood action here, right? Because these are sort of uniform for everybody. So let's suppose P1 was the highest probability node. So you, you, you selected this one here. Now, you got to this node and you realized that it's not a leaf node, right? There are more... It's not a terminal game, so you cannot resolve the final resolution. So the next step that you do is expansion.

So you will then run this node, this board state through the policy network. Note that this is the AI's move, right? AI is making this move. And so when we expand this tree, we're now thinking about what the human might do or any opponent might do. So this is like your opponent. The tree expansion process actually is completely... So when we evaluate the, um, the node here, we're going to now evaluate the node from the perspective of this player.

So then this one has possible actions that we could take, and, uh, we, we expand basically the, the, the leaf nodes here. So for each of these nodes that we could, you know, arrive at, we're going to now check how good those nodes are, right? So, so maybe, um, from here, the human could play here, the human could play here, or the human could play here. And we're going to, um, store essentially V-theta for each of these things. So V-theta of, you know, node one, or like node one prime, V-theta node one prime, V-theta. And so we're basically using our neural network to make an intuitive guess of how good is this board from the perspective of this player. And, uh, fortunately, because the, it's a zero-sum game, it's easy to deduce that the value for this player at this step is just 1 minus the value for, from this perspective. So it's easy to flip the search process depending on which player you're at.

Um, and so, so this is the expansion step. You've taken a non-leaf node and expanded it and evaluated the value. And this is essentially a quick guess as to, like, if I were to play to the end, am I going to win or not? So you can almost think about the V-theta as a shortcut for searching to the end of the tree for any given simulation.

Um, and then we're... And this is, this is essentially the evaluation step, where we're evaluating the quality of each of these boards. In original AlphaGo Lee, they actually did something, uh, kind of interesting, which is that they took this value and they averaged it with the value of a real Go playout. So they actually played a real game from here all the way to the end. So I'm just going to draw this squiggly line to indicate some path. And, uh, they kind of, like, played this all the way to the Tromp-Taylor resolution of a full board. And so this is like a zero or one, right?

And so they took this value and they just averaged it with this one here. So the, the formula they did was like, uh, you know, alpha times V-theta of, of, like, you know, some node, um, plus, uh, sort of, like, 1 minus alpha of a, of a true randomly sampled playout.

And you might be wondering, like, okay, well, how do they play this out, right? Like, it would be very, very costly to do another search on this playout, like almost like a tree within a tree. So they don't do this. Instead, they just take the policy network and play it against itself. So they just take this as both players and they just play it all the way to the end. And, and, um, this is something that helps ground the, um, the estimates here in reality, because you can get a single sample estimate of, like, whether you win or not. You can think about in the end game where the board is almost resolved, that this one actually becomes quite useful because the random... the play according to the policy will most likely decide a pretty reasonable guess of the game. And so you're not, you know, facing a problem where this one kind of becomes untethered from reality. It turns out this is totally unnecessary. So in all subsequent papers after AlphaGo Lee, they just got rid of this. And so in my implementation, I also did the same, and it speeds things up a lot because you don't have to roll these games out on every single simulation.

**DWARKESH** 1:16:40

Yeah.

**ERIC** 1:16:40

So, and this is why...

**DWARKESH** 1:16:41

Okay, so just make sure I understand this is like...

**ERIC** 1:16:42

If you have a cold start, like you're talking about, like, an AlphaZero type of scenario where you're just learning from scratch...

**DWARKESH** 1:16:48

Right.

**ERIC** 1:16:48

The only thing you're trying to do, at least for the beginning part of training, is getting the value function to be reasonably good.

**DWARKESH** 1:16:54

Right.

**ERIC** 1:16:55

And you can get that by just playing a lot of games. So you just play a bunch of random games, and you just get, like, a bunch of different, you know, wins, win rates for different states.

**DWARKESH** 1:17:01

Right.

**ERIC** 1:17:02

And, and that's like, that's what, that's what the AlphaGo Lee paper does. They take a bunch of human games, and then they just...

**DWARKESH** 1:17:06

Okay.

**ERIC** 1:17:06

Uh, they use that as a sort of warm start for their model. And then once you have that, then you can start the self-play loop.

**DWARKESH** 1:17:11

Right, got it.

**ERIC** 1:17:12

Because you have, you have now a reasonable estimate of the value function.

**DWARKESH** 1:17:14

And the MCTS you would only then do later, or?

**ERIC** 1:17:17

So, so the AlphaGo Lee team had two stages of training. The first stage was a supervised learning stage, which is what I just described here. So you have a fixed data set of games, and you just train this policy and value network to imitate those things. And then the second stage is, you start playing games. So you have a model that's reasonably good, and you just play it against itself. And then you do the MCTS on top.

**DWARKESH** 1:17:34

Got it.

**ERIC** 1:17:35

And then you can kind of do this kind of like, like, uh, this loop where you have MCTS improving your labels, and then you use the labels to train your neural network, and then the neural network then becomes better at doing the MCTS, and so on and so forth.

**DWARKESH** 1:17:46

I see, I see. Okay. Yeah.

**ERIC** 1:17:47

So it's a very nice virtuous cycle.

**DWARKESH** 1:17:49

Yeah. So the, the key innovation of MCTS here is that you're not just, it's not like in typical RL where you just get like a zero or one at the end of some trajectory. You get this much more fine-grained feedback from this one move you made because of the search process.

**ERIC** 1:18:03

Right, right. So MCTS... Yes. It's a, it's a method of converting a, a binary outcome into a per-step reward, in a sense.

**DWARKESH** 1:18:14

Yes, got it.

**ERIC** 1:18:14

Right.

**DWARKESH** 1:18:15

Okay. This is actually a very good way to explain it. Okay, continue.

I can't imagine doing this as a podcast interview. You ask good questions, so I feel like your students will also have the same questions. And that's nice. It's helpful to have literally just learned this two days ago, so it's fresh. It's like, "Oh, that's the thing I was confused on." I guess for you, it's been months, but to be honest, I do feel like a student myself. I would think about this almost like a student teaching other students and we're preparing for an exam—rather than a professor or something. Except you're a research scientist and I'm a podcaster.

Now we have a basic intuition of how moves are made with search. We're going to talk about how neural networks can speed this up by providing an analog to the human intuition here. There are two networks. There is the value network, which takes in a state and it predicts, "Am I going to win or lose?" It's a binary classification problem. Then we're going to have a policy network, which induces a distribution over good actions to take.

I'm going to draw a one-dimensional flattened move distribution, but this is really a square kind of grid. These are the probability distribution over good actions. Both of these are categorical classification problems, so you can train this like any classifier in deep learning with cross-entropy loss, that kind of stuff.

The specific architecture does not actually matter too much. I tried a few different architectures. Transformers work, ResNets work. For small data regimes, my experience is that ResNets still outperform transformers and give you more bang for the buck at lower budgets, but this may not be true.

Oh, wait, why is that? They provide the inductive bias of local convolutions. And generally, transformers start to outperform residual convolutional networks when you want more global context. An interesting finding from the KataGo paper was that they found it actually quite useful to pool together and aggregate global features throughout the network to give the network a global sense of how to connect value from one side of the board to another.

Well, what does it mean to aggregate global features? If you have a very large 19-by-19 Go board, and you've got some battles going on here and some battles going on here, when you pass this through a convolutional neural network, the receptive fields of the convolutional network are going to be good at computing local things and making that invariant. But they won't be able to connect these two features easily. They need to be pooled together and attend to each other somehow. The argument about why transformers are good for computer vision tasks, like with vision transformers and so forth, is that because they have global attention across the whole thing, they can more easily draw these connections. But you do need more data there so you can learn through data the invariant local features.

I've tried very hard to make transformers work for this problem because I was curious if transformers would present some sort of breakthrough in Go and just remove a lot of those tricks. But try as I might, I haven't figured out a way to make transformers better than ResNets for now.

One more tangential question. It makes sense why transformers with their global pooling of information would be better if you need to consider information that is not just spatially... CNNs give you a bias that the things which are next to you are especially relevant, and then they're aggregated up. For games where it isn't that relevant what is happening locally and you just have to consider the whole thing, you're saying transformers would work better. We're talking about the spatial dimension. How about the temporal dimension? Right now we're only considering the previous move because it is a deterministic, full-information game. But what if it was something like poker or diplomacy where a bluff they made a while back is relevant to understanding now and deciding your next move? You need to consider all those previous states. Would that then change the consideration of what inductive bias is most relevant and which architecture is most relevant?

**ERIC** 0:50:13

Great question. Go is a perfect information game, and in perfect information games, there does exist a Nash equilibrium strategy for which you can do no worse than any other strategy. If you know that your opponent has a particular bias, like they love to play aggressively, you can in principle counter that specific strategy better than a Nash equilibrium policy. But to counter any given strategy, there does exist a single Nash equilibrium that can be decided solely using the current state. That is a design choice that most Go agents—AlphaGo—chose to do, which in hindsight turned out to work very well because the Nash equilibrium seems to be superhuman. No human strategy seems to be able to beat it.

Now, there are variations of this where you would need to consider temporal history. This is a very exciting research area that I would encourage people to fork my repo and try these things out. If you were to play, let's say, 2v2 Go, then you need to model your partner's behavior. You may not have information on how they play, so you need to aggregate some information on how they play so that you can respond accordingly. These are situations where it's no longer a perfect information game. In games of imperfect information or partial observability, you do need some context to build a model. I think that's a place where things can get very exciting in terms of self-play or diplomacy style.

**DWARKESH** 0:51:46

Before we do that, can I ask a conceptual question? Based on how people talk about Go, and if you watch the AlphaGo documentary, people are just stunned that an AI can do this because it's thought to be a much more creative game that requires much more intuition. I know we only did a 5-by-5 board, but my intuition is based on that. I guess cornering pieces doesn't necessarily seem like the kind of thing where I'd think, "It's crazy how an AI could anticipate that this is how you corner a piece." Maybe you can give some intuition for why, on a larger board, the creative and open-ended nature of the problem really shines through.

**ERIC** 0:52:28

For sure. Just to clarify, I'm not a strong Go player by any means. I'm an amateur, and I learned Go a few months ago, so I might not have as deep an insight as maybe a professional Go player. But in the same way as chess, very brilliant moves in Go—where you switch very quickly from losing to winning, or you trick a player into winning a battle but losing the war—often have a lot of parallels to military strategy. The ancient Chinese used Go as almost a proxy for evaluating someone's intelligence because it was quite related to the art of both macro and micro.

In a similar way, when you play a game like StarCraft, people ascribe some level of creativity and intelligence to being able to manage both micro and macro at the same time. I think Go is a sort of prehistoric StarCraft analogy where you get to play a warlike game which involves local battles as well as a sort of global war.

**DWARKESH** 0:54:34

Okay, so now that we have the four-step process of Monte Carlo Tree Search, how can we use a neural network to improve it?

**ERIC** 0:54:40

Right, so we talked about the two ways that we can use neural networks to improve the search process. The first one is you can use the value function as a way to truncate your search early. And the second one is you can use the policy network to guide the search process so you don't consider bad actions.

So, let's go back to the four-step process and see where we can inject these neural networks.

**DWARKESH** 0:54:48

Okay, so just to put an aside on this, I should have explained this earlier. When you do MCTS on a given state, you're not just doing this once for every single state in the game. You actually have to redo the MCTS from scratch every single time you make a move. And so there's an outer loop where you play a full game and on every turn of that game, you do a full MCTS search to figure out what is the best move to take.

So what what's going on here in the four steps is what you do on a single turn of the game to decide what move to make. And you have your root node, which is the current state that you wanna play. And from there, we're gonna do a number of simulations. We'll pick a number of simulations, and for every simulation we do four things. The first is to select which branch to traverse. And we want to traverse branches that are both good—so we have some action-value for them—as well as branches that are unexplored, or that have a high probability of yielding a good result based on our policy network. So, the the kind of selection criteria that AlphaGo uses is this thing called "pucked," which balances the action value, so Q(S,A), with a sort of exploration bonus that's based on your prior probability of that action, which is given by the policy network, as well as the visit counts for for that specific node. So so that's the selection step. You'll kind of traverse down the tree according to this pucked rule.

And then once you hit a node that has not yet been expanded, you do the expansion step. And the expansion step involves taking that board state, running it through your policy network and value network to get P(a|S) and V\_theta(S). And the P(a|S) becomes the prior probability for the action selection for your children nodes. And V\_theta(S) is used for the evaluation step, which is where you take that value and then you do the backup.

You will back that up all the way to the parent node and update the action values for every single one of those. And you'll also increment the visit counts.

So you do this, you know, a thousand times, and at the end of this process, you will have a search tree that's been explored a thousand times according to this pucked rule. And you then take your final action by sampling from your visit counts. And this is your new improved policy. And you're trying to train your policy network to emulate that.

This is a good explanation. The key insight is that MCTS is being done per move. You're trying to figure out what's the next best move to make. And for each of these potential moves, you're rolling out a bunch of simulations. And you're doing this in a smart way. It's not just that you have an untrained model that you're rolling out. It's that you have these two things. You have the value network, which is telling you how good a board position is. And then you have the policy network, which tells you what moves you'd be likely to make from here. And you combine them into this pucked rule, which tells you how much you should explore each of these possible next moves, given how good you think they'll be and how confident you are in that assessment. And so you do this a thousand times. And at the end, you have a much better distribution of the next moves to make than what your policy network would have just told you. And then you try to train your policy network to emulate that.

So it's this very beautiful loop where every single step, you're just saying, let me create a smarter version of myself, and then let me become that smarter version.

**ERIC** 1:05:40

Exactly. And so if you imagine, you know, we have two models that we're training in the loop. We have the policy network that we just talked about, and we also have the value network. And you're asking like, well, what are we training the value network on?

The value network is trained on the final outcome of the game. So if you play a game against yourself and you win, then all of the states in that trajectory get a value of one. And if you lose, they all get a value of zero. And and so that's that's kind of like the naive way to think about how you might train the value function. And this presents this other kind of credit assignment problem, right? Like if you win, maybe one of your moves was bad, but you happen to win anyway. Or if you lose, maybe like you made a bunch of brilliant moves, but just one blunder was enough to lose.

So, so, um, the way that AlphaGo does this is actually they have a symmetry that you can exploit, which is that if you take any board in AlphaGo and you rotate it 90 degrees or you flip it, the value of that board should be the same. And so this is a great way that you can kind of do data augmentation on all the states that you have in your trajectory and just say like, all of these seven other configurations have the same final value. And that's enough to train a very strong value function. So, the value function is just trained on the outcome of the game, plus these, you know, uh, rotation and flip symmetries. And the policy network is trained on the MCTS self-play distillation target. And that's it. It's like, so just these two loss functions trained jointly, uh, in a self-play loop, is enough to get you to superhuman Go play. Yeah.

**DWARKESH** 1:07:07

It is really this amazing algorithm.

And I guess the only thing I'd add is this is not the sort of like naive self-play where you're just playing against yourself. Every couple hundred moves or a thousand moves, I forget what the original paper says, they checkpoint the model and you're not just playing against the latest version of yourself. You're playing against previous versions of yourself to make sure that you haven't just over-fit against your own play style. And so you're actually training against a league of your previous selves, not just yourself.

**ERIC** 1:07:37

And and you know, the league is very important for a lot of reasons. For example, like if you're training a very large model, you might just over-fit to the previous one and that's not good. Or if there's like a lot of cycles, it's very possible for like, you know, the paper beats rock, rock beats scissors, scissors beats paper. And so by having a league you're kind of playing against the whole population and trying to find the sort of optimal thing in the middle.

But you know, for my experiments, because I don't have a lot of compute, I just play it against myself. I just take the last version, play it against it, and I find that for a reasonable size, a 9-by-9 board, it it learns to play very well, very fast.

**DWARKESH** 1:08:12

Can I ask some questions that are not on the board?

**ERIC** 1:08:13

Yep.

**DWARKESH** 1:08:14

And actually, these are some of the same questions that came up for me when I was trying to understand AlphaGo. You just said that, okay, you win a game, so you assign one to all the states in the trajectory. You lose, you assign zero. Um, one question I had is, why not just the last state? Why all the states in the trajectory? Is that a form of data augmentation?

**ERIC** 1:08:34

Yeah, it's a form of data augmentation. Um, it's also a way to make sure that the value network is not, you know, uh, just sort of over-fitting to just final states. If you look at the final states of any Go game, it just looks like a bunch of filled squares. It doesn't actually have a lot of information. You want to kind of bias it to learn good things on the mid-game, because the mid-game is really where you have the opportunity to make big decisions.

**DWARKESH** 1:08:58

Okay. And then why not do something like what TD learning does, which is if you have these trajectories, S1, S2, S3, S4, S5, you could say that the value of S4 is equal to the value of S5 discounted by some amount? Is that because these trajectories aren't guaranteed to be optimal? Like, what what's the problem with that approach?

**ERIC** 1:09:21

It is definitely possible to do TD learning, and in fact, if you don't wanna do MCTS and you wanna have a value function, TD learning is probably what you wanna use. And what that looks like is you have an off-policy replay buffer where you're storing transitions, and then you have a Bellman update operator that's running in the background and updating your Q targets for you. This is an extremely common paradigm in robotics, and this actually does work. The problem is that it has high variance, so you need a lot of samples, and it could be very unstable. Like it's it's possible that your Bellman update, you know, if there's a bug in it, you just get garbage.

MCTS is a very different beast. You don't do any of that. The beautiful thing about MCTS is you take the final outcome of the game, and you actually just compute the average of the one-step Monte Carlo returns of your simulation, right? So so your Q of a given node in your tree is just the average of the value functions of all of its children, plus whatever rewards you picked up along the way. So it's much more stable, much simpler to implement, and so that's just why I think for Go, people kind of converge on that as a reasonable solution. But it's not to say that this TD learning thing is not useful. Like, you know, you can imagine a system that kind of combines them.

**DWARKESH** 1:10:43

What is the difference between a one-step Monte Carlo return and just the value of the final outcome of the game?

**ERIC** 1:10:48

Right. So if you have your root node and your tree, so so your tree... So a a Monte Carlo return is you play the whole thing out to the end and you get a, you know, a return of one or zero. And a one-step return is you take this, you go here, and you just take the value function that your neural network gives you at this state. And that's an estimate of the final return. So if this is one, and this is zero, and this is one, then the value of this node here is just the average of these guys, you know, so two-thirds.

**DWARKESH** 1:11:21

Right. And that's what you do.

**ERIC** 1:11:23

That's what you do, right. So you just take the one-step, uh, value-based roll-outs. You don't actually do any kind of full Monte Carlo roll-outs. Yeah.

**DWARKESH** 1:11:30

But then you said that the values are themselves trained on the full Monte Carlo roll-out.

**ERIC** 1:11:36

Yes. And so that's the kind of like interesting interplay where they're kind of coupled to each other. So the value function is just trained on the final outcome of the game. So if you won a game, all of your states for the past 300 moves are one. And then your policy network is trained on the MCTS outcome from this game.

**DWARKESH** 1:11:53

Right. I understand now.

**ERIC** 1:11:55

Yeah. So the policy gets the rich supervision of the MCTS, and the value function gets the sparse supervision of just the win or lose. Yeah.

**DWARKESH** 1:12:02

Another quick question. Um, why not give reward hacking? You mentioned that could happen. I guess the only thing I can think of is if you could just, like, end the game prematurely in a way that doesn't trigger the proper...

**ERIC** 1:12:13

Yeah. So so in AlphaGo, it's very easy to just have the, you know, engine count the stones and do the area scoring, and then you just get the return, right? But if you imagine, like, uh, some other environments, like, let's say robotics again, it's like a running gag here, like, um, sometimes you're like, I want to reward the robot for grasping an object. And you put a sensor on the hand, and then so the robot learns to just put its hand over the sensor, right? And and this kind of thing happens all the time. But because Go is a fully observable, fully simulatable environment, it's very hard to do reward hacking. The only way you can really do reward hacking is if you have a bug in your in your rules. Which which I had many, but, uh...

**DWARKESH** 1:12:51

Okay, let's let's talk about the broader picture for a second. Um, you said earlier that you were inspired to do this project because you're interested in the question of whether a better understanding of scaling laws or the bitter lesson would lead to you being able to do a lot more with a lot less. So what's your current thinking on that?

**ERIC** 1:13:10

My thinking is that scaling laws are a fundamental law of nature. They're going to happen. And if you have a problem that's kind of like well-posed for scaling, like it has a very rich data distribution, um, then if you just blindly throw compute at it, you will make progress. What I find is that for problems that are not like that, for example, Go, you you you have to be very careful that like every single thing that you're doing is actually making progress. So so it's not a matter of just like turning on the GPU and going home. You have to be very intentional about your reward design, about the data distribution that you're sampling from, how much of your policy is like being stochastic versus being greedy, right? All these things actually have to be very carefully tuned. It's not just a matter of like, you know, um, get a bigger GPU. And and that's kind of what I what I found, which is that, you know, at some point I was like, let's just make the models bigger, let's just use more simulations, let's just use a bigger batch size. And the progress was very incremental. And and and what actually helped the most was to make sure that the data was actually quite rich. For example, if you just play against yourself, that's not good enough. You need to play against a league of yourself. Or you need to play against some other opponent to make sure that you're not over-fitting.

**DWARKESH** 1:14:27

But I do think there's a distinction here between... and sorry for hammering on this point, but it seems very important... the kind of learning that you would do in Go versus the kind that you would do in a robotics setting where you can do this step-by-step improvement, where you're just like, let me be a little bit better than I was a second ago. Like, I I I ran all these simulations, and now I have a better move distribution, and now I'm going to update my model to have this better move distribution. The amount you improve at any step is small, but there is always a learning signal there. There's always some, you know, way in which MCTS will be better than the raw policy network. And so you're always getting this step-by-step improvement, whereas in RL... or at least the naive RL, like what you would do with a Transformer... you might be in a place where you're not getting any reward at all for a very long time, and you have to get lucky to explore into that one place where you're getting some sort of learning signal.

**ERIC** 1:15:23

I agree with that. Um, and and this is where I think a lot of the, you know, um, a lot of the magic comes in with, you know, large language models. The fact that they have so much pre-trained knowledge from the internet means that their priors are so strong that you don't actually need to do that much exploration to kind of guide it to the good spot. And so so this is kind of like the AlphaGo Lee recipe where you kind of have an offline data set that puts you in a good spot to then begin your RL journey. So so they are very related in that sense. Like, you know, if you if you had a blank Transformer and you told it to, you know, um, uh, you know, give me a story about, uh, you know, a happy elephant, like it just it would it would not know where to start, right? You'd have to wait until it happens to spell those words out, right? Um, so the pre-training is doing so much of the heavy lifting that it actually gets us into a place where the RL problems are now tractable.

And so that kind of is the final thing I'll kind of mention on this, which is that, you know, a lot of the cool stuff we see in LLMs actually has been studied in the games literature for many years. Like AlphaGo is a great example of this, where a lot of the RL innovations were not actually made by the LLM research teams; they were made by folks working in games. And so I would actually highly encourage folks working on LLMs to kind of go back to the game literature and just see what's been done before. Um, because I think a lot of those ideas are going to have a comeback, especially as, you know, LLM reasoning becomes a bigger thing.

**DWARKESH** 1:16:47

Cool. Well, thank you so much for this incredible lecture.

**ERIC** 1:16:49

You're very welcome. It's an honor to be on the podcast.

**DWARKESH** 1:16:51

By the way, if you're listening to this on an audio platform, this is a blackboard lecture, so I highly recommend switching over to a video platform like YouTube if you can to look at the math and the graphs and the Go board.

Let's apply the neural network to improve Monte Carlo tree search.

We'll start with our root node. We now have a four-step iterative process to do MCTS. This tripped me up when I was first reading the paper and trying to understand it, but essentially what we're going to do is choose a number of simulations. This number varies; it can be somewhere between 200 to 2,048. I believe in the AlphaGo Lee match, they used tens of thousands of simulations per move because they really wanted to boost the strength of the model as much as possible. But in training, you don't actually need too many, and KataGo, I think, uses something on this order as well.

Interestingly enough, modern Go bots don't need that much compute at test time. What we'll actually find out as we talk about how the MCTS policy improvement works is that over time, the raw network actually takes all of the burden of that big TPU pod and pushes it into the network. You can do all of that work with one neural network compute pass. But the TPU pod will always add the extra oomph on top, and so that's what they wanted for the match.

So, we're going to pick this number of simulations, and for every simulation, we're going to do several things simultaneously. We're going to see which moves are the best in the current tree. We're going to add extra leaves to the tree if we get to a point where we need to add a leaf. And we're going to update the action values for the tree. That's what every simulation involves: this four-step process. The four-step process is selection, expansion, evaluation, and backup.

At the beginning of our Monte Carlo tree search, our tree is very basic. It only has the root node, or our current board that our AI wants to play at. When this root node is created, we also know that we can evaluate this under our neural network and get the quantities Vθ, as well as our probability over actions. I'm going to say "root."

At the beginning of our Monte Carlo tree search, we have our root node, and we can initialize it with some children. We know its policy network evaluated on the root node gives us—on a 3x3 board with one existing stone placed—eight possible children that this AI could take. With each of the children, their policy network also gives us the probability of selecting that child.

The first step is to do the selection of the tree. This is a very shallow tree; all we have so far is a tree of depth one. Our first move is to select by maximizing, or argmaxing, the PUCT criteria, which is basically Q(s, a) \+ c\_PUCT \* P(a) / (N / (1 \+ Na)). For each of these, Na is zero for all of the actions initially, N is zero, and so we're going to just pick according to this. Initially, the chosen action here is most likely going to be biased towards the highest likelihood action here, because these are uniform for every node.

Let's suppose P1 was the highest probability node. You selected this one here. Now, you got to this node and you realize that it's not a leaf node. It's not a terminal game, so you cannot resolve the final resolution. The next step that you do is expansion. You will then run this node, this board state, through the policy network. Note that this is the AI's move; AI is making this move. When we expand this tree, we're now thinking about what the human might do, or any opponent might do. This is your opponent.

When we evaluate the node here, we're going to now evaluate the node from the perspective of this player. Then this one has possible actions that we could take, and we expand the leaf nodes here. For each of these nodes that we could arrive at, we're going to now check how good those nodes are. From here, the human could play here, here, or here. We're going to store essentially the Vθ for each of these things. We're basically using our neural network to make an intuitive guess of how good this board is from the perspective of this player. Fortunately, because it's a zero-sum game, it's easy to deduce that the value for this player at this step is just one minus the value from this perspective.

It's easy to flip the search process, depending on which player you're at. This is the expansion step. You've taken a non-leaf node, expanded it, and evaluated the value. This is essentially a quick guess: if I were to play to the end, am I going to win or not? You can almost think about the V-theta as a shortcut for searching to the end of the tree for any given simulation.

This is the evaluation step, where we're evaluating the quality of each of these boards. In the original AlphaGo Lee, they did something interesting: they took this value and averaged it with the value of a real Go playout. They played a real game from here all the way to the end, all the way to Tromp-Taylor resolution of a full board, which is a zero or one. They took this value and just averaged it with this one here. The formula was alpha times V-theta of some node, plus one minus alpha of a true, randomly sampled playout.

You might be wondering, "How do they play this out?" It would be very costly to do another search on this playout—almost like a tree within a tree. So they don't do this. Instead, they take the policy network and play it against itself. They just take this as both players and play it all the way to the end. This is something that helps ground the estimates in reality because you can get a single-sample estimate of whether you win or not. You can think about in the endgame where the board is almost resolved, this becomes quite useful because the play according to the policy will most likely decide a pretty reasonable guess of the game. You're not facing a problem where this becomes untethered from reality.

It turns out this is totally unnecessary. In all subsequent papers after AlphaGo Lee, they just got rid of this. In my implementation, I also did the same, and it speeds things up a lot because you don't have to roll these games out on every single simulation.

Just to reinforce my own understanding and re-explain: for the audience, the P in the select is the probability coming from the network—the policy network here. Fundamentally, a simulation is just rolling out one more node in the search process. A simulation is easy to think about when the whole tree already exists; you just walk down the tree using the PUCT selection criteria and keep going. In AlphaGo, the data structure is such that we begin with a tree that has only depth one, which is its only children, and you want to iteratively build out the tree as you're also selecting actions down the tree. That's the core thing here: because Go is such a combinatorially complex game, you cannot afford to build the tree in advance and then search it. You must search while building the tree.

The last step is the backup. Once you've scored these things, you basically take the mean. The Q-value assigned to the node here for taking this action is now just the average across your evaluated values. You take a running mean over all of the simulations that you've taken, and they average the values of the children nodes. That's what is known as the backup step. Once you evaluate this, you can recursively go back. If you know the action value of this node, you can then take the average on its parent, and so on.

You have this four-step process where you are choosing the best action that you know of so far. Then you may run into a node that you haven't been to before, so you need to grow the tree a bit. Then you run it through the network to guess whether you're going to win or not. And then you walk all the way back up to the root node to update your values on what the best moves are. As you do this iteratively, this selection criteria will cause you to visit—because you're always selecting according to this criteria, you're always going to be selecting the best action you think at any given branch. The final visit counts of how often you chose these things will reflect your correct policy distribution as induced through this search process. The visit count that we store in the node earlier becomes the vote for which way we should finally select an action.

You had asked me a question a few days ago about whether we could do everything with just the value function. This is the important thing that saved us on depth. Do we actually need something like the policy function here? It turns out that there are probably ways to get this to work without this. As you visit different actions, the Q-functions associated with them can be used to re-weight their own policy. In the same way that our final action here is decided by our visit counts, you could imagine that if this were uniformly random, we could still compute a good policy visit distribution by taking the softmax over Q on any given Q. If we did this, this would be a distribution over possible actions you could take, and you could use this in place of the policy network.

This is probably fine, but what this does is that when you are evaluating new leaf nodes you haven't been to before and you don't know their visit counts, at least you have a starting guess that helps a lot. It turns out that this doesn't actually have to be super good if you have the compute. If you imagine not having this, and we just did something very naive where our policy distribution is just induced by our visit counts on any given node, then you would need to spend extra work to search into every node to establish some sort of starting guess of the policy network, from which this one becomes much more effective.

The premise of the question is, since value is telling you how good a move will be, how is that conceptually different from the policy, which is also giving you the probability of Monte Carlo tree search having chosen a move? The policy just gives you those probabilities all at once, whereas if you were to iterate, you would have to do a forward pass for every single child node to get the value associated with that node in order to do the argmax and select the top child or the top next action.

Let me start over. It's worth thinking about whether we could make this even simpler. Could we maybe even get rid of the policy head and still make the thing work? When you do an expansion and then an evaluation at this node, you are checking the win probability of each of the child nodes. If this one is one and these are zero, you do know something about which action might be better to take. So why would you still need the policy head? Why not just normalize this into some distribution and call that your policy distribution? You can do this, and it probably does work, but in practice, having a single forward pass that gives you a pretty good guess is how the breadth is pruned out.

It would be weird if the policy recommended an action that disagreed with the value. If the policy said this was very high probability, but this one said it was a low value, then there's something fundamentally wrong between your policy head and your value head. They are linked, and you probably could get rid of the policy head if you came up with a different way to recover it from just the value evaluations. But you can usually batch these forward passes somewhat efficiently, so it probably is not a huge computational burden in practice. You would have to pass up to 361 boards into a single mini-batch update to evaluate all the values here, then normalize them.

There's a more important reason we still do this, which is how Monte Carlo tree search is used to feed back on itself and recursively improve its own predictions and search capabilities. That's where having this policy head as an explicit entity you're modeling, rather than an implicit normalization over your value, is a good idea.

As you roll out the number of simulations, you'll end up with a tree structure that has a lot of leaves that terminate and are not visited again because their value is deemed to be too low. But along one path, there will be a set of actions with very high visit counts that gravitate towards that one set of decisions as you increase N. This is the mental picture of what the tree in Monte Carlo tree search looks like. You should contrast this with an exhaustive tree like in tic-tac-toe, where you could say there's nine actions, then eight, then seven, then six, so it's a nine factorial-sized tree. The Monte Carlo tree search in Go is very, very sparse. It only considers the paths where you've expanded children nodes.

Now that we have the search algorithm that applies the value function and the policy function, we can talk about how the Monte Carlo tree search algorithm can act as an improvement operator on top of these guys.

**ERIC** 1:19:17

All of you are raised. Okay. I'll leave it all.

**DWARKESH** 1:19:41

Yeah.

We’ll now talk about the RL part of how this thing gets stronger by playing itself. Let's say we play a game where you have the AI. So you make a move, and the AI will compute the search. This is the visit count distribution. Let's say this is your initial policy recommendation at this node. Then after MCTS, it gets more confident about one of these actions. Maybe the distribution looks a bit more peaky like this based on the search. Of course, you can tune the search process so that it ends up more diffuse, but that's probably not a good idea. MCTS should get more confident about specific actions than others, but it of course might place a lot of weight on other actions initially. Then as you increase the number of sims, it should converge to a very peaky distribution.

So this is your new ... Let's wrap this in an MCTS operator of A given S. After applying the MCTS process, your policy recommended distribution looks like this. It's a bit more peaky than the previous one. Then you take the argmax, or maybe you just sample from this, it doesn't have to be the argmax, and then you make your move. Then you throw away the tree, and you begin anew on the next move.

Again, you compute a new distribution. So initially, maybe your guess looks like this, and then you refine it through MCTS to something that looks like this. So on every move, you have your initial guess from your policy network. Then the search process that combines your policy network and your value network arrives at a more confident action that you take. Then so and so forth, and then the game ends, and one person wins, and one person loses.

The beauty of how AlphaGo trains itself is that it can take this final search process, the outcome of the search process, and tell the policy network, "Instead of having MCTS do all this legwork to arrive here, why don't you just predict that from the get-go? Why don't you not use this guess and just predict this to begin with?" And if you have this guess to begin with in your policy network, then MCTS has to do a lot less work to get things to work.

If we draw a test time scaling plot—let's say this is number of simulations—let's say at zero simulations, your implicit win rate is here. Without any simulation, if you just take this raw action, this is what your win rate is. And let's say as we increase the number of sims, maybe you have a win rate that looks like this. So when you search for 1,000 simulation steps, that gets you to a policy here that gets you to here, which is great.

But if you were to distill this MCTS policy network back into your shoot from the hip policy network, then you could actually start here. If this was zero by distillation, then if you spend another 1,000 sim steps, then you get to here. It's almost like if you could amortize the first 1,000 steps into the policy network instead of the search process, then you could begin at a much better starting point and then get a much better result for the number of sims that you put.

**ERIC** 1:20:47

The save more nature of test time scaling, as the number of simulations increases, the increase in win rate is smaller. Is that true even for the distilled network? Is there some gain of, okay, we start from the distilled, we get these early gains again, or is that just inherent to the nature of MCTS?

**DWARKESH** 1:21:00

To be honest, I don't know the test time scaling behavior of MCTS simulations, and I believe it might be quite sensitive to how strong this one is in practice. I'm just drawing a monotonically increasing function that gets to one, so don't pay too much attention to the shape of the curve, just know that it's monotonic with respect to sim.

The idea of MCTS is very brilliant, which is we got something better by applying search, and we're going to now, on our next iteration of updating this network, just train this to approximate the outcome of 1,000 steps of search. Instead of starting here, we get to have our neural network start here, and then the play gets stronger once we then apply another 1,000 steps on top of it. You can keep going. The training algorithm for AlphaGo is to take the games where you've applied the search on every move that the policy encountered, whether you won or lost, which is quite important. You're just gonna train the model to imitate the search process.

There's an analogy to robotics, which is the DAGGER algorithm. First, I'm gonna draw a schematic of the states. Let's say we took a series of actions in an MDP to get a trajectory, and these actions may be suboptimal. Maybe we lost at the end of this game.

There's a family of algorithms that take trajectories and relabel the actions to better trajectories. Maybe a better action here would have been to take A0 prime. A better action here would have been to take A1 prime, and yet another one like A2 prime, A3 prime. So what MCTS is doing is saying you played this game where you eventually lost, but on every single action, I'm gonna give you a strictly better action that you should take instead. It does not guarantee that you are going to win, but it does guarantee that if you take these tuples as training data so that you retrain your policy network to predict these ones instead of these ones, you're gonna do better. This is very related to DAgger in robotics and imitation learning, where you want to collect an intervention here. Even if you're in a not great state—for example, a self-driving car that veers off the side of the road—there is still a valid action that corrects you and brings you back.

**ERIC** 1:23:03

Okay. So, pedantic question, but is there a guarantee that MCTS must be better than the policy? For example, you could imagine early on in training, because MCTS is informed by the value network, early on in training when the value network hasn't been well trained on finished games, that MCTS is worse than a randomly initialized policy. Is it a heuristic that MCTS is better than the policy, or is there some guarantee?

**DWARKESH** 1:23:31

In practice, it is a heuristic, and it also does work in practice. But let me illustrate an example where MCTS can give you a worse distribution than your policy network. This can often happen if your self-play algorithm has trained to a good point, but then somehow collapses because it's not trained on diverse data or something.

Let's say we have a board state where the policy recommendations here are very good. So pi of AS is great. But somehow, because maybe we're playing on a lot of games where the bots just resign instead of playing all the way to the trump tailor resolution, they forget how to evaluate those late stage plans. In the case that we showed with the corner play, maybe 100% of our training data in our replay buffer has lost examples of how to evaluate the value function at those states. So you might end up in a scenario where your terminal value is very bad.

If the terminal values of the leaves are not good, then this will propagate all the way up and cause your puck selection criteria and your backups to be off. Then you end up visiting a very different distribution than what your policy initially recommended. Also, if your number of sims is low, then you might also have a variance issue where you just don't explore enough. It's only guaranteed to converge when you take N to infinity. So variance in your search process, as well as inaccuracies in your evaluation, can screw with the quality of your policy recommendation. So that's why it's not a guarantee to improve. That is why I suspect AlphaGo Lee had the play outs to the end in their training algorithm so they could ground this thing in real plans. In practice, what you could also do is for 10% of the games, you prevent the bots from resigning and you just say, "Resolve it to the end." so you get some training data in your replay buffer to resolve those late stage play outs that normal human players would not play to.

So if you assume the value functions are correct, it's a very critical chain of assumptions. Assuming that this is accurate, your search process should give you a better recommendation than your initial guess.

**ERIC** 1:25:02

Okay. So just so I understand, if you have a cold started policy—an AlphaZero type thing—really what's happening for the first few epochs is the policy is kind of useless, and what you're really just doing is, "Let's play full games, and once we have played full games, for the preceding moves, we'll have labeled who won, who didn't win." The loss for AlphaZero has two components: how good is the policy relative to MCTS, and how good is the value prediction relative to who actually won the game from this move. This is applied to every single action, every single move. Really what's happening at the beginning of AlphaZero training is just we're trying to get the value function to predict who will win the game if you find yourself in this state and you're this player. Functionally, that's all that's happening. Later on, once that's well trained, now the policy is also improving.

**DWARKESH** 1:25:50

Correct. One trick I did find to be pretty useful—and this is not a peer reviewed claim, so take this with a grain of salt—I found it useful in my own implementation to do the following. You wanna first make sure that this is good before you invest a lot of cycles doing MCTS. It doesn't really make sense to do search on garbage value predictions. You wanna start at a good place where this works.

AlphaGo Lee does a very good thing where it just takes human games and then you train on it and it just works. Totally works. You could also take an open source Go bot, play it against itself, generate data—also works. If you have some offline data set that has realistic good play, you can easily learn the late stage value functions pretty well, and that's what you need to start the search process.

**ERIC** 1:26:42

Can you just read that sentence one more time?

**DWARKESH** 1:26:43

It's quite easy to evaluate a late stage Go game. When almost all the pieces are on the board, it's almost a decidable problem because there's lower and lower uncertainty as to the depth of the tree. Most games played to the end by reasonable people will be good training data to train a good value function at terminal parts of the tree. Then as you play more games, the search will back up good values into the intermediate nodes of the tree. As you increase the amount of data, your value head gets a good intuition of what is a healthy board state versus a not healthy board state. Those are much more subtle to judge in the mid-game than the beginning or the end. The most difficult part to score is not the beginning or the end because the beginning is obviously 0.5, and at the end it's pretty obvious who's winning. The hard part that you wanna learn in the value function is who is winning in the middle.

**ERIC** 1:27:44

This is very analogous to TD learning.

**DWARKESH** 1:27:46

Yes, and there's a beautiful connection to TD learning that we can talk about in a bit, as opposed to contrasting with Monte Carlo tree search. So you first wanna get good value functions, and expert data can give you a quick shortcut. I recommend for practitioners just do that first to initialize to a good starting point, and then if you wanna do the AlphaZero thing or KataGo tabula rasa learning, what you can try to do is on a small board play random games. Just take a random agent, and if you play 50,000 games, you'll learn a pretty good value function as well.

On a nine-by-nine board, you can see enough of the common patterns with random play. Then if you train a model that can train on both nine-by-nine and 19-by-nine data, and KataGo proposed one of these architectures, there's some pretty good transfer learning from the value head evaluated at nine-by-nine to the 19-by-nine.

**ERIC** 1:28:40

Because this, unlike other games, has a very much a sense of, there's nothing fundamental. There's not a new kind of piece that is introduced when you increase the size or something.

**DWARKESH** 1:28:49

If we take it to its limit and consider a very tiny three-by-three Go or four-by-four Go board, if you play 50,000 games, you're gonna have a lot of end states that look like human play. It's just like Tic-Tac-Toe at that point. If you broaden this to nine-by-nine or five-by-five, it's not unrealistic to imagine that purely random play will actually generate pretty reasonable-looking boards. You can score those pretty easily, and so that is what gives you the bootstrapping to be able to then improve your policy with search.

But it's very critical that MCTS has accurate value estimates. You need to ground the value. Ultimately, MCTS will fall apart if you don't have a grounding function for the value estimates.

**ERIC** 1:29:29

I'd be curious how much compute you save by training the value and policy on the same network that because they share the same representations how much more efficient learning is. 'Cause that would be interesting if they're basically kind of ... We've just talked about how they're kind of making similar predictions, or they should be in line with each other. And so I'd be curious if actually you're halving the amount of compute you gotta do by keeping them the same network.

**DWARKESH** 1:29:55

Right. AlphaGo Lee, the original AlphaGo paper, had two separate networks, and in all subsequent papers they merged them into two heads. Presumably this saves compute, but answering that question in a very rigorous scientific way is actually a simple question, but in practice actually takes ... If you really wanna chase that question down to its limit, it takes quite a bit of work to resolve that. But intuitively, yes, they share a lot of representations. As we mentioned, there's a sort of ... Your policy network and your value network when doing evaluation should agree. So there really should be consistency between them.

**ERIC** 1:30:33

Tell me if this is the wrong way to think about it. I feel like when I learn how an LLM works and how simple RLVF is, as an algorithm how simple it is, I'm stunned by the kinds of things it can do, that it can learn how to build very complicated code repositories and whatever simply from getting a yes/no. And here I feel if you understand it more deeply of just predicting MCTS and ... AlphaGo seems less impressive in retrospect the more you understand it because you're like, "Oh, you're putting in a lot of bias by saying how much you're telling it how it should titrate exploration as things go on. You're building this very explicit tree search for it." And so I don't know if you share that intuition where the more you understand it, the less impressive the accomplishment in 2017 seems.

**DWARKESH** 1:31:30

I personally disagree. I think they're profound for different reasons, and I don't understand the LMRL enough to comment on your podcast about it. But I think AlphaGo ... Why is it a profound accomplishment? Maybe it's worth stepping back a little bit and just ... It is different than modern RL, and we can talk a little bit about some of the algorithmic choices there. But I think the most profound thing here is that a 10-layer neural network pass—so basically 10 steps of reasoning—and of course the reasoning is not just one trail of thought, it could be the distributed representations and a lot of thoughts going on at the same time. But by construction, a 10-layer neural network can only do 10 sequential steps of thinking.

Ten steps of neural network paralyzed distributed representation thinking is able to amortize and approximate to a very high fidelity a nearly intractable search problem. This was a breakthrough that I think most people don't even understand today, like, fully comprehend how profound that accomplishment is. This is what also girds AlphaFold, for example, where you have a very difficult physical simulation process that you would need to roll out so many microscale simulations, and yet 10 steps of a somewhat small neural network can somehow capture what feels like an NP class problem into a single problem. It makes me wonder if our understanding of problems like P equals NP or these very fundamental computational hardness problems are incomplete. It's not like this is not a proof of P equals NP or anything, but there's something to it that is very disturbing where what felt like a very hard problem can fall to a very simple macroscopic solution.

**ERIC** 1:33:32

That is a very interesting insight that a lot of problems which are proven to be NP hard—I don't know if Go is proven to be NP hard, but—

**DWARKESH** 1:33:42

It's—

**ERIC** 1:33:43

—protein folding, et cetera, have been ... Neural networks can solve them 'cause they're NP hard in the worst case, but we're usually not concerned about the worst case. These problems have a lot of structure to them.

**DWARKESH** 1:33:53

I think the question we should be asking ourselves is that we've been formulating solutions to NP-hard problems as a worst case complexity. And I wouldn't say this solves Go. It doesn't give us an exact solution of the optimum, but in practice it is extremely useful. And the same thing has been shown in AlphaTensor, AlphaFold, where, yes, there is a very hard problem that in the worst case seems intractable, and yet we're able to make almost arbitrary amounts of progress.

So here's a sort of, in the limit, what might this look like? If you want to simulate something very complex like weather or predict the future, like, do we live in a simulation or not? The computing resources you need to build a very complex simulation might be much smaller than you think based on our ability to amortize a lot of that computation into the forward pass of a single network.

**ERIC** 1:34:50

To me, yeah, AlphaGo was the first paper that really showed this profound level of simulation being compressed into a small amount of—

**DWARKESH** 1:35:01

I think you're right. I think that's a very good way to put it.

**ERIC** 1:35:02

And contrast that, say, to something like a hash function, which is also incredibly dependent on initial conditions but doesn't have a macro structure, at least hopefully if the algorithms work.

**DWARKESH** 1:35:12

One would hope, yes, one would hope.

**ERIC** 1:35:14

And so there's no equivalent of a value function or broadly how's the weather gonna be that is interesting there. It's really just about what is the move, what is the board gonna look like 100 moves from now exactly.

**DWARKESH** 1:35:26

Intuitively that seems correct. This is also out of my area of expertise, but I find it interesting that cryptography has not been able to ... The tools of cryptography and hashing have also not been able to prove that you cannot come up with fast approximations, or you cannot come up with fast approximations. If they were able to do that, then you could prove P is not equal to NP.

**ERIC** 1:35:55

And in fact, we know that there's structure in many cryptographic protocols. Obviously, like RSA cryptography, there is structure, and that structure is what quantum computers exploit to break them.

**DWARKESH** 1:36:06

I see.

**ERIC** 1:36:06

Reiner, by the way, had an interesting aside in the—

**DWARKESH** 1:36:10

I think you're right. I think that's a very good way to put it.

**ERIC** 1:36:11

Reiner has a very interesting blog post, which we talked about in the episode, where he talks about how if you look at a high level what cryptographic protocols look like and what neural networks look like, it's extremely similar. Where you have sequential layers of jumbling information together, and it's because there's been this convergent evolution in the algorithms, where in cryptography you want the final state to be incredibly sensitive to initial conditions so that it can come out sort of looking jumbled based on if you change anything. And then neural networks, you similarly want everything to be dependent on all the information because you want to process all the information and consider how it relates to itself.

**DWARKESH** 1:36:51

You have the maximum power of a neural network at the edge of chaos. I think there's some research papers from Joshua Schult-Dicks on this. Um, yeah, there's something quite fundamental about chaos that is ... It's not just hopeless noise, it's like there's something useful in chaotic systems, at least at that boundary. But yeah, this is just my ... Think about it as a philosophy. I don't actually know the math well enough to comment on it.

Anyway, if we go back to ... We'll talk about LMRL in a little bit 'cause there are some connections there, but let's just go back to the MCTS. What is it doing? It is not, crucially it is not saying we're going to increase the probability of winning directly. It's not gonna say we're gonna up weight all actions that won and down weight all actions that didn't win. Importantly what it is doing is saying for every action we took, we did a pretty exhaustive search on MCTS to see if we could do better, and we're just gonna make every action that we took better by having the policy network predict that outcome instead. And so this is a very nice idea because you have one supervision target for every single action.

Let's talk a bit about if MCTS is the only self-play algorithm we could do. Could we do other things, maybe something that looks a little more like how modern LLM RL works?

Let me start with a bug that I had in my code for quite some number of weeks. This arose from my conceptual misunderstanding about how MCTS was supposed to be relabeling actions for moves that you took, instead of a more naive self-play algorithm where you just reinforce the winner. When I started implementing this, I would apply MCTS, which would boost the performance of the policy. Then I would take the winning trajectories and try to distill that back into the policy network. Do more of what won, and don't imitate what didn't win. This is a reasonable algorithm you could do.

But here's the problem. Let's say I have a strong baseline, policy B, and I'm doing something very simple, which is playing against policy B as a fixed opponent and trying to increase my performance against it. I picked KataGo as a baseline, and I'm training my model against it, applying MCTS, and taking the winner. For example, sometimes I would take the winning KataGo moves and use that as supervision for my model. What happened was, my performance would climb up to about 50%, and then it couldn't surpass that. I was stuck for a long time trying to figure out why it wasn't able to self-play itself to surpass my baseline KataGo. This is the mechanics of what's going on when you do it this way, if you're trying to just naively supervise your policy network to match the winning moves.

Let's suppose you have two models that are evenly matched, so they have a true win rate of 50%. You play 100 games, and each game takes 300 moves to resolve. Let's say, through random chance, you have 51 wins from policy A, your current policy, and 49 from your baseline. To have a very simple model of how it managed to win, let's say that for 50 games, they played very similarly, like identically, and the actions they took are no better than the current true policy outcomes. So if you were to train on those labels, they wouldn't change any of your behavior. Let's call those neutral labels, where retraining on it doesn't change your policy; it's kind of converged.

The number of neutral labels you have is basically 49 times 150\. And let's say, in the one game that we did win, there was just one decisive move that happened to be better than average, and so that's what gave us that one win. So there's basically one move you made, out of all the moves you made between both players, that gave you a good label. And for neutral labels, there are 99 games that you played on both sides, plus 299 average quality moves here. You have one label of good supervision. You don't know where it came from in this set of moves—just one move happened to be better—and the rest of the labels were performing exactly as expected. When you retrain the model on this dataset, this one good signal is going to be drowned out by the supervision of all of this signal.

So, so there's the sum of rewards is the return, right? So like, in our naive setup here, we only have a indicator variable for the return, where either you won or lost. So, um, so in the case where you lost, well, you just don't train on your gradient is zero. You don't train on those examples. And when you won, you try to predict those, those things, right? So you can think about this setup as a, as a special case of this general formula here.

The trouble here is that this is very high variance because when you multiply these terms out—when you take, when you try to compute the variance of this—if you expand this term, every version of this ends up cross-multiplying with itself. And because of the covariance between these terms, and then so there's a term that basically is a sum of all cross terms between these. So the variance grows quadratically with T. So the longer your episode is, the more noise there is in the credit attribution process for which action was actually helpful.

There's a connection here to LLMs, and why they don't do a multi-step prediction. So let's consider like an analogy in LLMs where we want to use a similar objective to reward good responses. In an LLM you might say like, "hello," and then this is your prompt, your ST, and then you say like, "world, how may I help?" And maybe this is chunked into tokens like this. So there's like six, or sorry, yeah, six decisions here. So why is, you know, in LLMs, why do they do one sequence here as opposed to six, T is six, right? It turns out that if you don't have this term, if this is like one, then the sum of log probs here will actually be the same as the total log probability across the sequence.

However, in sampling things, if you have a reward term assigned to every specific token, now you have these interaction effects between the cross multiplication of these terms and these terms. And so the problem becomes, how do you ascribe the credit associated with every episode to all of these different terms here?

So, if we assume this is one, then this is actually the same. Now, the hidden assumption about how this behaves is that in a multi-step environment, if you were to chop this up into separate probabilities, the interaction effects—so if we assume this is one, then this is actually the same. So the interaction effects—when you treat the problem as individual sequences, it will cause this to have also higher variance as well.

**ERIC** 2:07:05

But is there a guarantee that MCTS must be better than the policy? For example, you could imagine early on in training, because MCTS is informed by the value network, early on in training when the value network hasn't been well-trained on finished games, um, that like MCTS is worse than the sort of randomly initialized policy. So is it just a heuristic that MCTS is better than the policy, or is that like there's some guarantee?

**DWARKESH** 2:07:31

In practice, it is a heuristic, and it does work in practice. But let me illustrate an example where MCTS can give you a worse distribution than your policy network. You might end up in a scenario where your terminal value is very bad. If the terminal values of the leaves are not good, then this will actually propagate all the way up and cause your puck selection criteria and your backups to be off. And then you end up visiting a very, very different distribution than what your policy initially recommended.

Also, if your number of SIMs is low, then you might also have a variance issue where you just don't explore enough. Like, it's only guaranteed to converge when you take N to infinity. So, so variance in your search process as well as inaccuracies in your evaluation can definitely screw with the quality of your policy recommendation. And so that's why it's not a guarantee to improve. But, and that is why I think I suspect why AlphaGo Lee had the playouts to the end in their training algorithm so they could ground this thing in real playouts.

In practice, what you could also do is just like for 10% of the games, you prevent the bots from resigning and you just say like resolve it to the end so you get some training data in your replay buffer to really resolve those kind of like late-stage playouts that normal human players would, would kind of not play to.

So, this is why MCTS, if you assume that the value functions are correct, why it gives you a better policy is because assuming, and it's a very critical chain of assumptions, assuming that this is accurate, then your search process should give you a better recommendation than your initial guess.

**ERIC** 2:09:40

So, to unify this with LLMs, we do something close to this, or conceptually like sort of working backwards from, "Hey, let's do all these trajectories and hopefully one of them solves the unit test on some coding environment, and then let's reinforce those trajectories." And we do that because the real world is not amenable to this like forward, iterative search where even if you haven't gotten the right answer, you can sort of have this strong, you basically know that, "Hey, if I just do search locally here, and this search is sort of truncated at the end by this value function that works even if I haven't unfolded my whole trajectory," you can just say, "This is my new policy, and I can improve in a more iterative, like local way, rather than having to unfold all these trajectories and..."

Sorry, let me-- I guess there's two separate things. Sorry, for talking. There's two separate things, actually. Uh, there's one of-- Actually, the DeepCTR paper talks about why they didn't do Monte Carlo Tree Search when they tried it. And so there's both a breadth and a depth thing of why Monte Carlo Tree Search doesn't work in LLMs. The depth thing is that you can train a value function with AlphaGo that does a pretty good job of approximating, "Hey, we've encountered a new leaf node. We can just give some estimate of every node above it on how well..." Hey, okay, the depth thing is that, uh, you can truncate trajectories much earlier on. And so you don't have to explore the full depth. Um, you can, you can start getting, "Okay, this is a good trajectory to go on, there's a good direction to go in," um, much earlier on. And the breadth thing is that in Go, there's 361 legal actions at most, whereas the space of all possible thoughts or all possible actions is not-- yeah, it's, it's... And so you can't build, like, a descendant children that is like millions of, millions broad.

**DWARKESH** 2:11:51

The beautiful thing about AlphaGo is that it never has to deal with this problem. Yeah, yeah, okay, sorry. But I mean, I, I think I, I have a lot of, I have some following questions on this.

What we talked about in a naive approach where you just take the winner and you just imitate them, right? And we find that if we do that, where this is an indicator function of, you know, one if you won and zero otherwise, then the variance actually grows here as the square of T. And there's also a multiplicative factor here as well. The gradient, the variance is also actually proportional to R of tau squared. So, what we talked about in a naive approach where you just take the winner and you just imitate them, right? And we find that if we do that where this is an indicator function of you know, one if you want and zero otherwise then the variance actually grows here as the square of T. And there's also a multiplicative factor here as well. The gradient, the variance is also actually proportional to R of τ squared.

The beautiful thing about AlphaGo is that it never has to deal with this problem.

**ERIC** 2:12:12

Right.

**DWARKESH** 2:12:12

Okay, so just to understand, this is like, if you win a game against another policy, you sort of reinforce all the actions on that trajectory? Yes. So here, you can use a number of algorithms like PPO, VMPO, uh, you know, Q learning even if you want. Like, uh, the specific algorithm here, um, can be, you know, it's usually a model-free thing because you don't have search.

But it's a very interesting connection from MCTS and Q learning that I, I, I want to, you know, bring up. So, in MCTS, you do something where you have a tree, and through the resolution of your, your value function at the, at the leaves of the tree or, you know, your approximate leaves of the tree, you can kind of back up through, through the, you know, the, the sequence of many sequences, and then obtain some sort of mean value estimate, right? Your Q is kind of derived from the average of a bunch of simulations.

In model-free algorithms, there is often a component of estimating a Q-value. And so, um, and Q, Q-values are often learned through TD learning. Although in PPO, the, the way they do advantage estimation is not necessarily through a Bellman backup, but, um, but in Q-learning, there's this kind of a very cool trick where, so, intuitively, how this works is like, if you have an MDP, and then this is like, you know, terminal, what this is sort of saying is that like, the best action you can take at this state is equal to the reward you take for, you know, taking this action, plus the best that you can do at the next step. So, this is sort of recursive and dynamic programming property of, of MDPs. And you can train neural networks to basically try to enforce this consistency, right? So, you can say, like, "Well, once I know the Q-value of this action, I can then use that to kind of compute something about the Q-value for..."

**ERIC** 2:14:14

So, when earlier I was like, "Hey, why are we training policy? Why don't we just train the value alone?" That is what this is.

**DWARKESH** 2:14:20

Um, this is an algorithm for recovering value estimates of intermediate steps when you don't have the ability to do forward search. So, you must collect a trajectory first of like N steps before you're able to do this trick. But the intuition is kind of the same, which is that like, knowing something about the Q-value here can tell you something about the Q-value here, and indeed you can recover a policy from a Q-value. So, so the, um, you don't need to explicitly model the policy distribution. You can actually recover the policy distribution by doing argmax over your, um, your Q-values. So, so Q, uh, Q-learning or, um, you know, this kind of like, uh, approximate dynamic programming kind of propagates what you know about the future Qs backward like this. And you can see that there's a sort of similar structure that goes on here, where in this case, you're planning over trajectories your agent hasn't actually been to yet, whereas in this case, you're planning over trajectories your agent has visited. So, so importantly, why does Q-learning, you know, why was Q-learning a big deal, right? Like it's because historically, we just haven't had the ability to do search on fairly high dimensional problems like robotics or whatever. So for a long time, we kind of make the assumption that like, "Okay, well if we can't model the dynamics with like a world model or something, we're going to instead just collect trajectories, and then plan with respect to the only number that really matters, which is reward."

**ERIC** 2:15:39

Okay, so the beautiful thing about AlphaGo is that it never has to deal with this problem?

**DWARKESH** 2:15:45

Correct. The one small addendum, you don't discard all of that, you keep one thing behind that we'll use later.

**ERIC** 2:15:52

Let me know when you think it makes sense to restart. I can ask the question again.

**DWARKESH** 2:16:11

Yes, that's right. The problem is how do you ascribe the credit associated with every episode to all of these different terms here.

Okay, so we talked about a naive approach where we just take the winner and we just imitate them. And we find that if we do that, where this is an indicator function of, you know, one if you won and zero otherwise, then the variance actually grows here as the square of T. There's also a multiplicative factor here as well. The gradient, the variance is also actually proportional to R of tau squared.

The beautiful thing about AlphaGo is that it never has to deal with this problem.

Okay, right. We talked about a naive approach where we just take the winners and we just imitate them. We find that if we do that, where this is an indicator function of one if you won and zero otherwise, then the variance actually grows here as the square of T, and there's also a multiplicative factor here as well. The gradient, the variance is also actually proportional to R tau squared.

There's a connection here to LLM RL, why they don't do a multi-step prediction. Let's consider an analogy in LLMs where we want to use a similar objective to reward good responses. In an LLM, you might say, "Hello." This is your prompt, your ST. And then you say, "World, how may I help?" Maybe this is chunked into tokens like this. So there's six decisions here. Why is, in LLMs, why do they do one sequence here as opposed to six? T is six. It turns out that if you don't have this term, if this is one, then the sum of log probs here will actually be the same as the total log probability across the sequence. The problem with this is that this introduces a multiplicative factor into the variance of each of these terms. And this will make it much harder to train, because you're multiplying essentially the final outcome. Every term is getting multiplied by this final outcome here, and then the variance grows as this. Because there's a covariance between each of these responses, this also actually grows as a function of T.

I guess I don't understand what are the two different possibilities. What does it mean to do the whole sequence as one? You're, if you have a trajectory, you get the log probabilities of every token in that trajectory, you calculate the gradient with respect to.

**ERIC** 2:10:01

You treat the whole thing as just one response. When you compute the log probability here, you just say, "According to my transformer decoder, what is the probability of this sequence?"

**DWARKESH** 2:10:11

Okay, so just to make sure I understand, what is different about doing that versus treating them independently? What is actually the difference between how you're calculating those?

**ERIC** 2:10:20

The difference is whether you want to consider each of these having a different credit assignment in generating your final...

**DWARKESH** 2:10:27

But what is actually different about how it's implemented? How would you implement them differently?

**ERIC** 2:10:30

You would not sum up a set of log probs, you would just have the total log prob of your sequence, and then you would...

**DWARKESH** 2:10:38

But isn't the total log prob of your sequence just the sum of log probs?

**ERIC** 2:10:41

Ah, shit. Okay. Sorry, I need to revisit this.

**DWARKESH** 2:11:13

Okay, so we were just talking about how the good move, the out-of-distribution move, is a small fraction of all the moves that are played across all the games on which you'd want to train. This of course reminds me of how LLMs are trained with policy gradient methods. Karpathy, when he was on the podcast, called it sucking supervision through a straw. It's interesting that this thing you're saying, which would be intractable and prevents you from actually getting beyond a certain level in Go, is just by default how LLMs are trained, question mark?

**ERIC** 2:11:30

Right. In this case, this is not to say it doesn't work. If you imagine increasing the number of games to millions of samples, you actually can get some meaningful supervision samples, so long as you find a way to sort of mask out the supervision from these guys. This is where things start to get pretty related to RL in terms of advantage and baselines and so forth. So let's look at the gradient variance of a very naive approach like this. I'm just gonna call it gradient RL. And it's basically the sum of rewards... Okay, I see what you're saying.

The sum of rewards is the return. In our naive setup here, we only have an indicator variable for the return, where either you won or lost. In the case where you lost, you just don't train on... your gradient is zero. You don't train on those examples. And when you won, you try to predict those things. You can think about this setup as a special case of this general formula here. The trouble here is that this is very high variance because when you multiply these terms out, when you try to compute the variance of this—so variance of the gradient is equal to the expectation of squared minus... and just for simplicity, we can pretend this is on average zero or something if you're centering it at no signal—and the variance here basically means that you're taking the square of this product term. So you end up with a term that kind of grows quadratically with the T. So a variance, when you have a setup like this, this thing acts as a coupling effect on top of these terms here.

Let's actually map this to an LLM case, and we can answer, why do LLMs only do one-step RL instead of a multi-step RL scenario? In LLMs, you have a decoder that might predict some words like "hello world." In current LLM RL, they treat this entire sequence as a single action, just AT, and big T is just one. Yes, it is true that because of how transformers are formulated through the product of conditional probabilities, we do have... the probability of this sequence is equal to the sort of sum of, log probability of the whole sequence is equal to the sum of the probabilities of individual tokens. So in this case I would say something like log hell plus log lo plus log world. This is true. And if this term were one, then they would be the same thing. However, in sampling things, if you have a reward term assigned to every specific token, now you have these interaction effects between the cross-multiplication of these terms and these terms.

**DWARKESH** 2:13:33

And so the problem becomes how do you ascribe the credit associated with every episode to all these different terms here? I guess the thing I'm confused on is what would that even look like to do it that way in LLMs? Because you only get a reward at the end of the episode.

**ERIC** 2:13:43

You could imagine a reward that says, "I'm going to give you some process supervision where you get a reward for each of these actions on every step."

**DWARKESH** 2:13:50

Okay, so you're saying, instead of doing it that way where you... well, I guess the way you've written it, it would be a sum at the end anyway, so they wouldn't have to be multiplied. But you're saying instead of doing it that way, you would just add up this process rewards at the end and then treat that as one single reward signal.

**ERIC** 2:14:03

Correct, for one single long action. But...

**DWARKESH** 2:14:05

Isn't that how it's written to begin with anyway? Like the sum of the rewards?

**ERIC** 2:14:07

Yeah. So the thing that's a little bit hidden here in the math is that we're assuming that when you decompose the problem to a multi-step problem, you're now introducing kind of correlations between your actions through the computation of this guy. And so if you separate these things out, then there will be... this will magnify the variance of this one. In the case where you don't separate it out, if you just have T equals one, you just have a single estimate of log prob and a single estimate of reward. Now, this this term still shows up in... So in LLMs it looks a little bit more like the naive reinforced estimator looks a bit like return of the single action plus times... It looks kind of like this. This is sort of the very basic form here, but this is still a contributor to variance. You want to make sure that, similar to how in this case we were training on a lot of neutral labels, you want to make sure that you're sort of penalizing the labels that don't help and only rewarding the ones that actually make you better. Intuitively, the analogy here is like, "Can we find a term in our training objective such that it's actually kind of discouraged from doing this, or these don't have any effect on the gradient, and this has an effect on the gradient?"

**DWARKESH** 2:14:55

I guess if you applied that there, the only thing you could do is eliminate 49 of the games. So at least the way you have it written there, it would be 51 times...

**ERIC** 2:15:01

Actually, the optimal case is to pull out, discard all of these moves, and only get a gradient on that single move that you got better.

**DWARKESH** 2:15:09

But how would you do that?

**ERIC** 2:15:11

Right. So this is a pretty tricky problem in practice. This is where advantage estimation happens in reinforcement learning. So you want to subtract a term from your your multiplier. Instead of an indicator function of one and zero, you want something that kind of behaves like a zero for all of these guys and then a one for all these ones.

**DWARKESH** 2:15:33

But so you could do that if there's... if you can say, "Hey, I won this game, so this is slightly above baseline performance."

**ERIC** 2:15:39

Well, you won on a lot of games. But you don't know which ones let you win because they were truly better versus winning on accident.

**DWARKESH** 2:15:47

So how would you design a baseline where it's truly better?

**ERIC** 2:15:50

Yeah, so this is where in RL, people use things like TD learning to better approximate the quality function, the Q that we mentioned earlier. So you can try to subtract that from your your return. So ideally what you really want to do is in RL, you want to push up the actions that make you better than the average and push down the actions that make you worse than the average. They call this advantage. There are multiple ways to compute it. I highly recommend John Schulman's General Advantage Estimation paper as a good treatment on how to think about various ways to compute it. But at the end of the day, you want to reduce variance by trying to make this smaller so it doesn't magnify the variance of this one. Makes sense.

**DWARKESH** 2:16:15

So but this requires you to have a very good estimate of what average performance from a state would look like and this is, this gets us back to the value function thing we were talking about earlier.

**ERIC** 2:16:22

Right. And so this, keep in mind that in this case, this model-free RL setting, is trying to solve a credit assignment problem where you don't know which actions were actually good and which ones were bad. Monte Carlo tree search is doing something very fundamentally different, which is it's not trying to do credit assignment on wins. It's trying to improve the label for any given action you took. And so we can actually think about a completely different algorithm called neural fictitious self-play, which was used to great effect in systems like AlphaStar and OpenAI's Dota. So let me talk a little bit about how you can kind of unify some of these RL ideas in the model-free setting as well as the self-play setting.

Okay, so what happens if you don't have the ability to easily search a tree? In Go, it's a perfectly observable game. You can easily construct a pretty deep tree that completely captures the game state. In a game like StarCraft where you don't have complete control over the binary, it's a little bit hard to do this and I'm not even sure it's a deterministic game. So that makes this kind of difficult from a data structures perspective. So, what is done instead is that the basic idea of supervising your actions with a better teacher is still there. If, like given neural fictitious... we're gonna talk a little bit about how neural fictitious self-play works...

Same idea, we're gonna come up with better labels for each of the actions we took, just like in MCTS. But how do we derive the better labels? In MCTS, we perform search to, and assuming we have a good value function, the search will kind of give us a better result than our initial guess. In a game where you can't easily simulate a search process, what they do instead is train what is known as a best response policy. So you fix your opponent. Let's say you're currently training Pi A against a strong opponent, Pi B. In StarCraft, maybe these are the Zergs and you're playing Protoss or something.

So you fix your opponent and you treat this as a classic model-free RL algorithm where your goal is just to beat this guy. So here you use your standard TD learning style tricks or use PPO or any actually, like, model-free RL algorithm to try to hill climb against winning this player. And so you train... you train, basically, you have a reward function that's like, "Return is like one if wins against Pi B." So this is no longer a self-play kind of problem, this is just like a fixed opponent and you're just solving it, trying to maximize a score against them, and then zero otherwise. So you have a sort of fixed environment where all you care about is just beating this guy.

Once you have a good policy that you trained with, you know, pick your favorite model-free RL algorithm, PPO or SAC or any kind of mixture of the or, you know, VMPO or whatever, you now have a good policy that gives you a good label for what this one should do when playing against that player. When you train multiple best response policies, you can basically then distill the RL algorithms into the labels for a given opponent. So you might have, let's say, a best response policy against Pi B and then maybe you have a league of, you know, of opponents, like Pi B, Pi C, Pi D. You're going to take the best response policy that you train against each of these fixed opponents and for this one, you're going to supervise them with the label that this one would provide.

So it is kind of like this is almost like a proxy for your MCTS teacher. Instead of an MCTS teacher, you use a model-free RL algorithm to find the best search action that you could do to to kind of beat your opponent. And then you're finally, you're distilling the policy here into what is known as like a mixed strategy where it's trying to basically average across all possible opponents you could play against. This is what gives you something that can do no worse than an averagely average selected opponent from the league. And so this gets around the problem of having to derive a teaching signal from MCTS, but it's still fundamentally is about relabeling your your states with better actions so that they improve your policy.

**DWARKESH** 2:19:50

And just to make sure I understand, this is like if you win a game against, win a game against this other policy, you sort of reinforce all the actions on that trajectory?

**ERIC** 2:19:57

Yes. So here you can use a number of algorithms like PPO, VMPO, Q-learning even if you want. The specific algorithm here can be... it's usually a model-free thing because you don't have search. But there's an interesting connection from MCTS and Q-learning that I want to bring up. So in MCTS, you do something where you have a tree, and through the resolution of your value function at the leaves of the tree or your approximate leaves of the tree, you can kind of back up through the sequence of many sequences and then obtain some sort of mean value estimate. Your Q is kind of derived from the average of a bunch of simulations. In model-free algorithms, there is often a component of estimating a Q value. So, Q values are often learned through TD learning, although in PPO, the way that they do advantage estimation is not necessarily through a Bellman backup.

But in Q-learning, there's this very cool trick where you do... QS A is backed up as R plus some discount factor times the max a Q of your next step. So intuitively, how this works is if you have a MDP, and then this is like terminal... what this is sort of saying is that the best action you can take at this state is equal to the reward you take for taking this action plus the best that you can do at the next state. So there's a sort of recursive and dynamic programming property of MDPs and you can train neural networks to basically try to enforce this consistency. So you can say like, "Well, once I know the Q value of this action, I can then use that to kind of compute something about the Q value for for these steps."

**DWARKESH** 2:21:14

So when earlier I was like, "Hey, why are we training policy? Why don't we just train the value alone?" That is what this is.

**ERIC** 2:21:20

This is a algorithm for recovering value estimates of intermediate steps when you don't have the ability to do forward search. So you must collect a trajectory first of n steps before you're able to do this trick. But the intuition is kind of the same, which is that knowing something about the Q value here can tell you something about the Q value here. And indeed, you can recover a policy from a Q value. So you don't need to explicitly model the policy distribution. You can actually recover the policy distribution by doing argmax over your your Q values. So, Q-learning or this kind of like approximate dynamic programming kind of propagates what you know about the future Qs backward like this. You can see that there's a sort of similar structure that goes on here where in this case, you're planning over trajectories your agent hasn't actually been to yet, whereas in this case, you're planning over trajectories your agent has visited.

So importantly, why does Q-learning... why was Q-learning a big deal? It's because historically we just haven't had the ability to do search on fairly high-dimensional problems like robotics or whatever. So for a long time we kind of make the assumption that like, okay, well, if we can't model the dynamics with like a world model or something, we're going to instead just collect trajectories, and then plan with respect to the only number that really matters, which is reward.

**DWARKESH** 2:22:36

Okay, so to unify this with the LLMs... we do something close to this, or conceptually like working backwards from, "Hey, let's do all these trajectories and hopefully one of them solves the unit test on some coding environment and then let's reinforce those trajectories." And we do that because the real world is not amenable to this like forward, iterative, uh, tree search, where even if you haven't gotten the right answer, you can kind of have a strong guarantee that just the process of thinking itself has resulted in you having some better policy. And so you can train to match the thing you got with more search even if you haven't solved the problem yet.

**ERIC** 2:23:10

Correct.

**DWARKESH** 2:23:10

Could you say that one more time? I didn't fully comprehend. Um, okay, to... Okay, so this is very interesting, and then to unify this with our discussion of LLMs, so with LLMs you're doing something... you don't have Q values but you're doing this sort of backwards learning where, "Hey, let's find the trajectories which pass some unit test in some coding environment, and then let's reinforce those trajectories." Mm-hmm. Um, and, uh, and then the hu- is it... there's a huge difference between that and this forward approach with MCTS. And the reason you can do MCTS, and it's much more preferable to do MCTS because you can do it per move and make each move better rather than having to learn per trajectory, and hope, as Karpathy said, hope to learn this like- Through a straw? Yeah, to get this supervision through a straw. Uh, basically just upgrade all the tokens in a trajectory that might or might not have been relevant to getting the answer right. The reason you can do this much more sort of sample-efficient, much more favorable thing with Go is that because MCTS works in Go, you can sort of have this, uh, strong... like, uh, you basically know that, hey, if I just do a search locally here and this search is sort of truncated at the end by this value function that works even if I haven't unfolded my whole trajectory, I can just say this is my new policy, and I can improve in a more iterative, like, local way, rather than having to unfold all these trajectories and... sorry. I guess there's two separate things. You're mostly on the right track, but...

**ERIC** 2:24:29

Yeah. You're on the right track. Yeah, yeah.

**DWARKESH** 2:24:29

There's two separate things actually. Uh, there's one of... actually, the DeepSeek-R paper talks about why they didn't do Monte Carlo tree search and they tried it. And so there's both a breadth and a depth thing of why Monte Carlo tree search doesn't work in LLMs. I'm trying to say this out loud just in case, so just so you can correct all the things I'm saying wrong. The depth thing is that you can train a value function with AlphaGo that does a pretty good job of approximating, "Hey, we've encountered a new leaf node, we can just give some estimate of every node above it on how well the..." Hey, okay. The depth thing is that you can truncate trajectories much earlier on and so you don't have to explore the full depth. You can, you can start getting, okay, this is a good trajectory to go on, there's a good direction to go in, much earlier on. And the breadth thing is that Go... Sorry, this is a totally different thing, the R1 thing is not relevant to this. Yeah.

**ERIC** 2:25:20

The breadth thing is also relevant in the sense that in Go it's a fixed set of moves, whereas in robotics it's like a uncountably large number of possible actions.

**DWARKESH** 2:25:26

And then the breadth thing is that in Go there's like 361 legal actions at most, whereas the space of all possible thoughts or all possible actions is not... yeah, it's, it's... And so you can't build like a list of descendant children that is like millions broad.

**ERIC** 2:25:53

So there was some research, I think, from Google in 2023, 2024, where they did try to apply tree structures to reasoning. And I think it's, you know, the jury is still out as to whether this can ever work. So I would say, we probably will see, you know, revisiting of this idea of forward search in the future. But there's two things that make MCTS very simple for Go, which is that value estimation is kind of concrete and you can determine it for real, and then you can kind of sort of use it to truncate depth, as you said. And then the breadth is also determined. And what's kind of critical is that the action selection algorithm where you iteratively visit and grow the tree is well suited for the size of problem that Go is and the depth of the problem. But for something like LLM reasoning, Puct might actually not be a good enough heuristic. It might be too greedy with local tokens and it might do something like only give you, you know, sort of obvious thoughts that are correct, but not really solve your final problem. So I would say the jury is probably still out on how, like, what the final instantiation of reasoning for LLMs would look like, and I wouldn't rule out that like this stuff could, you know, come back. But don't LLMs sort of natively learn to do MCTS, where they'll try and approach and be like, "Oh, that doesn't work. Let's back up. Let's try this other thing," and then go in the direction that proves to be more fruitful?

Seemingly, yeah. I'm not a reasoning researcher, so I'm not super sure. That being said, I think the idea of doing forward search and simulation to get a better sense of what is valuable might make a comeback, even though not exactly in the same instantiation as AlphaGo.

**DWARKESH** 2:26:50

But, uh, just to make sure I understand the crux of it, like the, the breadth from the number of legal actions being wider and the depth from being able to, not being able to train a value function as easily because...

**ERIC** 2:27:00

So here's an example of where LLMs break down. The C-puck rule involves, you know, square root of N over 1 plus Na. In an LLM, you're most likely never going to sample the same child more than once. So if you have, let's say, multi-steps of thinking, because language is so broad and open-ended, a sort of discrete set of actions is not really an appropriate choice for an LLM, even though there are discrete tokens. It's just such a large number that this type of exploration heuristic is probably not the right thing to do to guide how to search down a tree.

**DWARKESH** 2:27:31

Right. But I guess the crux comes down to the fact that in Go you know that the MCTS is almost certainly better than your current policy even though you haven't gotten, even though you haven't explored the end of any trajectory.

**ERIC** 2:27:46

Correct.

**DWARKESH** 2:27:46

And then in a, in normal reasoning for LLMs or robotics, there's no way to just locally evaluate and improve your next move in a way that doesn't result in, in a way that's independent of actually solving the problem.

**ERIC** 2:28:02

No way is a strong word. I think lots of people have thought about how to try to apply MCTS or its kind of successors like MuZero to continuous control spaces, and I'm sure very cool research work is still ongoing to try to crack that problem. But yes, the seeming challenge right now is that most problems in much higher dimensional, you know, action spaces or something that's combinatorially much bigger, like language, they don't seem as amenable to the kind of discrete action selection heuristics as well as kind of game evaluation type stuff that Go does. But that's not to say the idea of, like, you know, thinking into the future along multiple parallel tracks might not give you some information about, like, which way to search. Like if you think about mathematics, I think mathematics often occupies a little bit more of, like, a logical search procedure where you kind of can back up, you can kind of see, like, which paths seem good or not. There's more of a rigid structure there, whereas maybe in a, you know, business negotiation or something, it's less of a tree and maybe something a bit different.

**DWARKESH** 2:29:10

Okay, so why is this not just that with a baseline the R of T term grows more slowly?

**ERIC** 2:29:15

We should forget about the baseline for now. I'm trying to answer a more concrete question about, like, yes, the sum of log of the whole sequence is the sum of the individual probabilities. There is a hidden assumption about how this behaves when you do a... So even though the individual terms are the same, the kind of explanation is that when you treat the problem as individual sequences, it will cause this to have also higher variance as well. So the interaction effects... if we assume this is one, then this is actually the same. Now, the hidden assumption about how this works is that in a multi-step environment, if you were to chop this up into separate probabilities... let me actually, I think I got it. I can write it now. Okay. Sorry for not having a...

**DWARKESH** 2:29:59

I instantly fold when I know I don't understand something.

**ERIC** 2:30:04

Why don't we start over? I think it's good if we...

**DWARKESH** 2:30:10

Maybe I'll instigate it. I think you just explained the probability of how the move is such a small fraction, or the good move is such a small fraction... sorry, the out of distribution... Yeah, sorry, I'll just ask that question.

**ERIC** 2:30:33

All right.

**DWARKESH** 2:30:33

Okay, so we were just talking about how the good move, the out of distribution move, is a small fraction of all the moves that are played across all the games on which you'd want to train. And this of course reminds me of how LLMs are trained with policy gradient methods. Karpathy, when he was on the podcast, called it "sucking supervision through a straw." It's interesting that this thing you're saying, which would be intractable and prevents you from actually getting beyond a certain level in Go, is just by default how LLMs are trained, question mark?

**ERIC** 2:30:57

Right. So in this case, this is not to say it doesn't work. If you imagine increasing the number of games to millions of samples, you actually can get some meaningful supervision, like samples, so long as you find a way to sort of mask out the supervision from these guys. And then this is where things start to get pretty related to RL in terms of advantage and baselines and so forth. So let's look at the, you know, the gradient variance of a very naive approach like this. I'm just gonna call it like gradient RL, and it's basically the, you know, sum of rewards... Okay, I see what you're saying.

So the sum of rewards is the return. So in our naive setup here, we only have a indicator variable for the return where either you won or lost. So in the case where you lost, well you just don't train on... your gradient is zero. You don't train on those examples, and when you won, you try to predict those things. So you can think about this setup as a special case of this general formula here. The trouble here is that this is very high variance because when you multiply these terms out, when you take, when you try to compute the variance of this—and so variance of the gradient is equal to the expectation of the gradient squared minus the expected value of the gradient squared—and just for simplicity, we can pretend this is, you know, on average zero or something, if you're centering it at no signal. And the variance here basically means that you're, you know, taking the square of this product term, and so you end up with a term that kind of grows quadratically with T. So a variance, when you have a setup like this, this thing acts as a coupling effect on top of these terms here.

Let's actually map this to an LLM case, and we can answer, why do LLMs only do one-step RL instead of a multi-step RL scenario? In LLMs, you have a decoder that might predict some words like "hello, world." In current LLM RL, they treat this entire sequence as a single action, just AT, and big T is just one. Yes, it is true that because of how transformers are formulated through the product of conditional probabilities, we do have... the probability of this sequence is equal to the sort of sum of, log probability of the whole sequence is equal to the sum of the probabilities of the individual tokens. So in this case I would say something like log hell plus log low plus log world. This is true. And if this term were one, then they would be the same thing. However, in sampling things, if you have a reward term assigned to every specific token, now you have these interaction effects between the cross-multiplication of these terms and these terms. And so the problem becomes how do you ascribe the credit associated with every episode to all these different terms here?

**DWARKESH** 2:33:32

I guess the thing I'm confused on is, what would that even look like to do it that way in LLMs, because you only get a reward at the end of the episode?

**ERIC** 2:33:43

You could imagine a reward that says, "I'm going to give you some process supervision where you get a reward for each of these actions on every step."

**DWARKESH** 2:33:50

Okay, so you're saying, instead of doing it that way where you... well, I guess the way you've written it, it would be a sum at the end anyway, so they wouldn't have to be multiplied. But you're saying instead of doing it that way, you would just add up the process rewards at the end and then treat that as one single reward signal.

**ERIC** 2:34:03

Correct, for one single long action. But...

**DWARKESH** 2:34:04

Isn't that how it's written to begin with anyway? Like the sum of the rewards?

**ERIC** 2:34:07

Yeah. So the thing that's a little bit hidden here in the math is that we're assuming that when you decompose the problem to a multi-step problem, you're now introducing kind of correlations between your actions through the computation of this guy. And if you separate these things out, then there will be... this will magnify the variance of this one. In the case where you don't separate it out, if you just have T equals one, you just have a single estimate of log prob and a single estimate of reward. Now, this term still shows up in... so in LLMs it looks a little bit more like the naive reinforced estimator looks a bit like the return of the single action plus times... It looks kind of like this. This is sort of the very basic form here, but this is still a contributor to variance. You want to make sure that, similar to how in this case we were training on a lot of neutral labels, you want to make sure that you're sort of penalizing the labels that don't help and only rewarding the ones that actually make you better. Right. So intuitively, the analogy here is like, "Can we find a term in our training objective such that it's actually kind of discouraged from doing this, or these don't have any effect on the gradient, and this has an effect on the gradient?"

**DWARKESH** 2:34:55

I guess if you applied that there, the only thing you could do is eliminate 49 of the games. So at least the way you have it written there, it would be 51 times...

**ERIC** 2:35:01

Actually, the optimal case is to pull out, discard all of these moves and only get a gradient on that single move that you got better.

**DWARKESH** 2:35:09

But how would you do that?

**ERIC** 2:35:11

Right. So this is a pretty tricky problem in practice. And so this is where advantage estimation happens in reinforcement learning. So you want to subtract a term from your multiplier. Instead of an indicator function of one and zero, you want something that kind of behaves like a zero for all of these guys and then a one for all these ones.

**DWARKESH** 2:35:33

But you... so you could do that if there's... if you can say, "Hey, I won this game, so this is slightly above baseline performance."

**ERIC** 2:35:39

Well, you won on a lot of games, but you don't know which ones let you win because they were truly better versus winning on accident.

**DWARKESH** 2:35:46

So how would you design a baseline where it's truly better?

**ERIC** 2:35:50

Yeah, so this is where in RL people use things like TD learning to better approximate the quality function, the Q that we mentioned earlier. So you can try to subtract that from your your return. So ideally, what you really want to do is in RL, you want to push up the actions that make you better than the average and push down the actions that make you worse than the average. They call this advantage. There are multiple ways to compute it. I highly recommend John Schulman's general advantage estimation paper as a good treatment on how to think about various ways to compute it. But at the end of the day, you want to reduce variance by trying to make this smaller so it doesn't magnify the variance of this one. Makes sense.

**DWARKESH** 2:36:15

But this requires you to have a very good estimate of what average performance from a state would look like and this is, this gets us back to the value function thing we were talking about earlier.

**ERIC** 2:36:22

Right. And so this, keep in mind that in this case, this model-free RL setting is trying to solve a credit assignment problem where you don't know which actions were actually good and which ones were bad. Monte Carlo tree search is doing something very fundamentally different, which is it's not trying to do credit assignment on wins, it's trying to improve the label for any given action you took. And so we can actually think about a completely different algorithm called neural fictitious self-play, which was used to great effect in systems like AlphaStar and OpenAI's Dota. So let me talk a little bit about how you can kind of unify some of these RL ideas in the model-free setting as well as the self-play setting.

Okay, so what happens if you don't have the ability to easily search a tree? In Go, it's a perfectly observable game. You can easily construct a pretty deep tree that completely captures the game state. In a game like StarCraft where you don't have really complete control over the binary, it's a little bit hard to do this and I'm not even sure if it's a deterministic game. So that makes this kind of difficult from a data structures perspective. So what is done instead is that the basic idea of supervising your actions with a better teacher is still there. If, like, given neural fictitious... so we're going to talk a little bit about how neural fictitious self-play works...

Same idea, we're going to come up with better labels for each of the actions we took, just like in MCTS. But how do we derive the better labels? In MCTS, we perform search, and assuming we have a good value function, the search will kind of give us a better result than our initial guess. In a game where you can't easily simulate a search process, what they do instead is train what is known as a best response policy. So you fix your opponent. Let's say you're currently training Pi A against a strong opponent, Pi B. In StarCraft, maybe these are the Zergs and you're playing Protoss or something.

So you fix your opponent and you treat this as a classic model-free RL algorithm where your goal is just to beat this guy. So here you use your standard TD learning style tricks, or use PPO, or any actually, like, model-free RL algorithm to try to hill climb against winning this player. And so you train... you train, basically, you have a reward function that's like, "Return is like one if wins against Pi B." So this is no longer a self-play kind of problem, this is just like a fixed opponent and you're just solving it, trying to maximize a score against them, and then zero otherwise. So you have a sort of fixed environment where all you care about is just beating this guy.

Once you have a good policy that you trained with, you know, pick your favorite model-free RL algorithm, PPO or SAC or any kind of mixture of the, or you know, VMPO or whatever, you now have a good policy that gives you a good label for what this one should do when playing against that player. When you train multiple best response policies, you can basically then distill the RL algorithms into the labels for a given opponent. So you might have, let's say, a best response policy against Pi B and then maybe you have a league of opponents, like Pi B, Pi C, Pi D. You're going to take the best response policy that you train against each of these fixed opponents and for this one, you're going to supervise them with the label that this one would provide. So it is kind of like this is almost like a proxy for your MCTS teacher. Instead of an MCTS teacher, you use a model-free RL algorithm to find the best search action that you could do to to kind of beat your opponent. And then you're finally, you're distilling the policy here into what is known as a mixed strategy where it's trying to basically average across all possible opponents you could play against. This is what gives you something that can do no worse than an averagely average selected opponent from the league. And so this gets around the problem of having to derive a teaching signal from MCTS, but it still fundamentally is about relabeling your your states with better actions so that they improve your policy.

**DWARKESH** 2:39:50

And just to make sure I understand, this is like if you win against, against, win a game against this other policy, you sort of reinforce all the actions on that trajectory?

**ERIC** 2:39:57

Yes. So here you can use a number of algorithms like PPO, VMPO, Q-learning even if you want. The specific algorithm here can be... it's usually a model-free thing because you don't have search. But there's an interesting connection from MCTS and Q-learning that I want to bring up. So in MCTS, you do something where you have a tree, and through the resolution of your value function at the leaves of the tree or your approximate leaves of the tree, you can kind of back up through the sequence of many sequences and then obtain some sort of mean value estimate. Your Q is kind of derived from the average of a bunch of simulations. In model-free algorithms, there is often a component of estimating a Q value. So Q values are often learned through TD learning, although in PPO, the way that they do advantage estimation is not necessarily through a Bellman backup.

But in Q-learning, there's this very cool trick where you do... QSA is backed up as R plus some discount factor times the max a Q of your next step. So intuitively, how this works is if you have a MDP, and then this is like terminal... what this is sort of saying is that the best action you can take at this state is equal to the reward you take for taking this action plus the best that you can do at the next state. So there's a sort of recursive and dynamic programming property of MDPs and you can train neural networks to basically try to enforce this consistency. So you can say, "Well, once I know the Q value of this action, I can then use that to kind of compute something about the Q value for for these steps."

**DWARKESH** 2:41:14

So when earlier I was like, "Hey, why are we training policy? Why don't we just train the value alone?" That is what this is.

**ERIC** 2:41:20

This is a algorithm for recovering value estimates of intermediate steps when you don't have the ability to do forward search. So you must collect a trajectory first of n steps before you're able to do this trick. But the intuition is kind of the same, which is that knowing something about the Q value here can tell you something about the Q value here. And indeed, you can recover a policy from a Q value. So you don't need to explicitly model the policy distribution. You can actually recover the policy distribution by doing argmax over your your Q values. So Q-learning or this kind of like approximate dynamic programming kind of propagates what you know about the future Qs backward like this. You can see that there's a sort of similar structure that goes on here where in this case, you're planning over trajectories your agent hasn't actually been to yet, whereas in this case, you're planning over trajectories your agent has visited.

So importantly, why does Q-learning... why was Q-learning a big deal? It's because historically we just haven't had the ability to do search on fairly high-dimensional problems like robotics or whatever. So for a long time we kind of make the assumption that like, okay, well, if we can't model the dynamics with like a world model or something, we're going to instead just collect trajectories, and then plan with respect to the only number that really matters, which is reward.

**DWARKESH** 2:42:36

Okay, so to unify this with LLMs, we do something close to this, or conceptually like working backwards from, "Hey, let's do all these trajectories and hopefully one of them solves the unit test on some coding environment and then let's reinforce those trajectories." And we do that because the real world is not amenable to this like forward, iterative, uh, tree search where even if you haven't gotten the right answer, you can kind of have a strong guarantee that just the process of thinking itself has resulted in you having some better policy. And so you can train to match the thing you got with more search even if you haven't solved the problem yet.

**ERIC** 2:43:10

Correct.

**DWARKESH** 2:43:10

Could you say that one more time? I didn't fully comprehend. Um, okay, to... Okay, so this is very interesting, and then to unify this with our discussion of LLMs, so with LLMs you're doing something... you don't have Q values, but you're doing this sort of backwards learning where, "Hey, let's find the trajectories which pass some unit test in some coding environment, and then let's reinforce those trajectories." Mm-hmm. Um, and, uh, and then the hu- is it... there's a huge difference between that and this forward approach with MCTS. And the reason you can do MCTS, and it's much more preferable to do MCTS because you can do it per move, uh, and make each move better rather than having to learn per trajectory, and hope, as Karpathy said, hope to learn this like- Through a straw? Yeah, to get this supervision through a straw. Uh, basically just upgrade all the tokens in a trajectory that might or might not have been relevant to getting the answer right. The reason you can do this much more sort of sample-efficient, uh, much more favorable thing with Go is that because MCTS works in Go, you can sort of have this, uh, strong... like, uh, you basically know that, hey, if I just do a search locally here and this search is sort of truncated at the end by this value function that, uh, works even if I haven't unfolded my whole trajectory, I can just say this is my new policy, and I can improve in a more iterative, like, local way, rather than having to unfold all these trajectories and... sorry. I guess there's two separate things. You're mostly on the right, right track, but...

**ERIC** 2:44:29

Yeah. You're on the right track. Yeah, yeah.

**DWARKESH** 2:44:29

There's two separate things actually. Uh, there's one of... actually, the DeepSeek-R paper talks about why they didn't do Monte Carlo tree search, and they tried it. And so there's both a breadth and a depth thing of why Monte Carlo tree search doesn't work in LLMs. I'm trying to say this out loud just in case, so just so you can correct all the things I'm saying wrong. The depth thing is that you can train a value function with AlphaGo that does a pretty good job of approximating, "Hey, we've encountered a new leaf node, we can just give some estimate of every node above it on h- how well the..." Hey, okay. The depth thing is that you can truncate trajectories much earlier on and so you don't have to explore the full depth. You can, you can start getting, okay, this is a good trajectory to go on, there's a good direction to go in, much earlier on. And the breadth thing is that Go... Sorry, this is a totally different thing, the R1 thing is not relevant to this. Yeah.

**ERIC** 2:45:20

The breadth thing is also relevant in the sense that in Go it's a fixed set of moves, whereas in robotics it's like a uncountably large number of possible actions.

**DWARKESH** 2:45:26

And then the breadth thing is that in Go there's like 361 legal actions at most, whereas the space of all possible thoughts or all possible actions, um, is, is not... yeah, it's, it's... And so you can't build like a chil- a, a, um, a list of descendant children that is like millions broad.

**ERIC** 2:45:53

So there was some research, I think, from Google in 2023, 2024, where they did try to apply tree structures to reasoning. And I think it's, you know, the jury is still out as to whether this can ever work. So I would say, we probably will see, you know, revisiting of this idea of forward search in the future. But there's two things that make MCTS very simple for Go, which is that value estimation is kind of concrete and you can determine it for real, and then you can kind of, uh, uh, sort of use it to truncate depth, as you said. And then the breadth is also determined. And what's kind of critical is that the action selection algorithm where you iteratively visit and grow the tree is well suited for the size of problem that Go is and the depth of the problem. But for something like LLM reasoning, Puct might actually not be a good enough heuristic. It might be too greedy with local tokens and it might do something like only give you, you know, sort of obvious thoughts that are correct, but not really solve your final problem. So I would say the jury is probably still out on how, like, what the final instantiation of reasoning for LLMs would look like, and I wouldn't rule out that like this stuff could, you know, come back. But don't LLMs sort of natively learn to do MCTS, where they'll try and approach and be like, "Oh, that doesn't work. Let's back up. Let's try this other thing," and then go in the direction that proves to be more fruitful?

Seemingly, yeah. I'm not a reasoning researcher, so I'm not super sure. That being said, I think the idea of doing forward search and simulation to get a better sense of what is valuable might make a comeback, um, even though not exactly in the same instantiation as AlphaGo.

**DWARKESH** 2:46:50

But, uh, just to make sure I understand the crux of it, like the, the breadth from the number of legal actions being wider and the depth from being able to, not being able to train a value function as easily because...

**ERIC** 2:47:00

So here's an example of where LLMs break down. The C-puck rule involves, you know, square root of N over 1 plus Na. In an LLM, you're most likely never going to sample the same child more than once. So if you have, let's say, multi-steps of thinking, because language is so broad and open-ended, a sort of discrete set of actions is not really an appropriate choice for an LLM, even though there are discrete tokens. It's just such a large number that this type of exploration heuristic is probably not the right thing to do to guide how to search down a tree.

**DWARKESH** 2:47:31

Right. But I guess the crux comes down to the fact that in Go you know that the MCTS is almost certainly better than your current policy even though you haven't gotten, even though you haven't explored the end of any trajectory.

**ERIC** 2:47:46

Correct.

**DWARKESH** 2:47:46

And then in a, in normal reasoning for LLMs or robotics, there's no way to just locally evaluate and improve your next move in a way that doesn't result in, in a way that's independent of actually solving the problem.

**ERIC** 2:48:02

No way is a strong word. I think lots of people have thought about how to try to apply MCTS or its kind of successors like MuZero to continuous control spaces, and I'm sure very cool research work is still ongoing to try to crack that problem. But yes, the seeming challenge right now is that most problems in much higher dimensional, you know, action spaces or something that's combinatorially much bigger, like language, they don't seem as amenable to the kind of discrete action selection heuristics as well as kind of game evaluation type stuff that Go does. But that's not to say the idea of, like, you know, thinking into the future along multiple parallel tracks might not give you some information about, like, which way to search. Like if you think about mathematics, I think mathematics often occupies a little bit more of, like, a logical search procedure where you kind of can back up, you can kind of see, like, which paths seem good or not. There's more of a rigid structure there, whereas maybe in a, you know, business negotiation or something, it's less of a tree and maybe something a bit different.

**DWARKESH** 3:09:57

In a dagger-style setup, your optimal training data distribution is that here are your optimal states and actions. You want to be in this state, you want to be in this state, you want to be in this state, and then you win here. These are your optimal policy actions, so these are the things you definitely want to train on. But to make it robust to disturbances, you want to make sure that if you happen to drift off into some other states, you can funnel yourself back. But why isn't this a fully general argument for off-policy training? This is why you want to do off-policy training sometimes. You don't want to have a compounding error where if you make a mistake, you don't have the data of how to return back to your optimal distribution.

In applications like robotics, a gust of wind might blow you slightly off, and then you need to correct. Or the friction on one of your tires is a little bit lower than the other wheel, and now your car is drifting and you have to correct it. These kinds of things often happen in more real environments. There was a funny quote about chess and Go: "The problem with Go and chess is that the other player's always trying to do some shit." So things can drift off. You always want to be able to correct back to your winning condition. Your replay buffer really should have the states that your policy would visit, plus a distribution of states that you might drift to, and then how to return back to your optimal states.

If you take this to the extreme and say, "We don't have any of this data, and we're going to just be labeling with MCTS states that are so far away from our optimal behavior," like this bag of states over here, each of them gets an MCTS label. Your policy learns how to take the best possible action here, but you never get here. So you're training your model on states you would never reach. This is not there, so this is a problem. And this is where off-policy can really hurt.

As part of this project, I did try an experiment where I took a bunch of trajectories and, to saturate the GPU as much as possible, I took random states from the data set and reran MCTS on just those states. Instead of playing a whole game where I'm doing MCTS on every move, I just ignore the causality of moves, pick random board states, and label those with my current network. I might revisit old states that I've labeled before and relabel them again with my current network. In practice, this actually does work. You can take some states that are reasonable and constantly be relabeling them while we're training. This starts to converge on a very robotics-like setup, which is very common. You have your data set of trajectories, and then you have something like a replay buffer pusher. These are off-policy, offline trajectories. Your replay buffer pusher pushes transition tuples to the replay buffer. Then you have some job that's continuously replanning what the best action you should have done instead of taking this action is. In robotics, it's very common to use a Bellman updater to minimize TD error. It's constantly pulling things from here and trying to satisfy the QSA.

**ERIC** 3:14:59

So what is the trainer?

**DWARKESH** 3:14:59

The trainer is you try to minimize QSA and Q target.

**ERIC** 3:15:09

Can you explain the whole setup again at a high level?

**DWARKESH** 3:15:12

You have your off-policy data that came from various policies. You're constantly pushing transitions that you saw before to a replay buffer. Then you've got this thing called a Bellman updater, which basically replans, "Instead of this action, what action should I have taken at S to have a better value?" The way you enforce that is you try to minimize the TD error. So, given this, you have S-prime. You compute Q of S-prime, and you find the action that should go with S-prime that makes this Q value as high as possible.

You add that to the reward here, and that gives you your actual target. For this current S and A, your Q target is this. Now you send back the Q target to this transition. With this tuple, you pair with that a Q target. Then here on the trainer, you simply use supervised learning and you minimize your current network's QSA with its target.

**ERIC** 3:16:13

So in the background, you're just thinking through how valuable all these actions actually were.

**DWARKESH** 3:16:19

In a more optimal policy where you're trying to maximize this, what is the Q target of this transition?

**ERIC** 3:16:24

It's like daydreaming.

**DWARKESH** 3:16:26

You can think about it like you're going back in hindsight and being like, "Given what I've seen in the historical buffer, was there a better action I could have taken?"

The connection to Go here that I tried, and it was moderately successful but too complex to open source, was you replace this with an MCTS relabeler. Instead of doing this kind of target network computation, you run MCTS on your transition. So in this case, you have your state, your action, and then whether you won or not at the game. You can just toss those two. You don't care about these ones. You just take your state and you plan MCTS to get your best policy on your current network—not the network that took this action, but your current best policy network. You just rerun your search offline on these transitions.

If these are transitions that your policy can get to, then this acts as a very nice stabilizing effect. The one other benefit is that you can fully saturate your GPU better because you're not blocking on the Go game to give you board states. You just simply search across all board states at any depth in parallel. The trainer would then just predict the MCTS label. So again, this works, and this is quite relevant in robotics where you just have a lot of offline data and you can't simulate things like MCTS.

But in practice, it does run into the problem where if the current model is looking at states that it would never reach, then it's wasting capacity. So you have to be a little bit careful here. The on-policy thing, and also much of RL has converged to a much more on-policy setup, where they don't really try to directly train on off-policy data. At best, they use off-policy data as a way to reduce variance, but not directly influence the objective.

Why have they converged to that? It's just more stable. You might use the off-policy Q as a way to do advantage computation, like Q minus some of Q. That's like your... or sum of... like there's N actions. So this is your value, and then this is your kind of current Q values. Your advantage for that action is like the average value minus your current one. So people can try to estimate Q in an off-policy way and then just use advantage here. Then, if there's a problem in these dynamics, it doesn't blow up your loss as much. So in robotics, there's a convergence towards using off-policy data to shape your rewards, but not directly.

I'm reminded now of our earlier conversation about why MCTS is so favorable compared to the policy gradient kind of thing LLMs do. And this might be totally wrong, but I wrote a blog post a few months ago about how RL, at least policy gradient RL, is even more inefficient than you might think. The inefficiency one thinks about naively is the fact that you have to roll out a whole trajectory in order to get any learning signal at all. As these trajectories become longer and longer, instead of an agent just having to complete the next word in the sentence, it has to do two days' worth of work to figure out if it even did the project correctly. As you have to unroll two days' worth of thinking to see if you even did something correctly, like implement a feature, the amount of samples per flop has been decreasing.

You're trying to maximize, as you're learning, bits per flop. You can think of bits per flop as samples per flop times bits per sample. What I just mentioned a second ago is that the samples per flop go down as RL becomes more and more long-horizon.

But this kind of naive RL is also terrible from a bits-per-sample perspective. Here's what I mean, at least compared to supervised learning. Early on in training, let's say you have a vocabulary size for an LLM that is 100K long, so there are 100K possible tokens that one could answer. You have a totally untrained model and a prompt like, "The sky is..." With supervised learning, the model would have some probability distribution over all the things it could say. There's a label that says the term here is "blue," and it would learn through cross-entropy loss exactly how far its distribution is from correctly saying "blue."

Now, if you were doing this through RL, the model would try, "The sky is halicon." Nope, that's wrong. "The sky is told." Nope, that's wrong. This is a totally untrained model. You would have to do this on the order of a hundred thousand times to just stumble on "blue," then get some learning signal off of that and improve. Exactly. And what's also tough is that the distribution you're sampling under is your policy's distribution. So if your policy has no chance of sampling "blue," you will never get a signal. That's being modeled by the fact that your probability of sampling "blue" is extremely low. If you do sample it, you learn as much as you would have in supervised learning. But in all other cases—in 99.999% of cases in an untrained model—you're just learning incredibly little from seeing that "halicon" is not the correct word or "told" is not the correct word.

The amount you learn is a function of your pass rate. The further away you are from "blue," the more you've learned to go towards "blue" using cross-entropy loss. You can think of it as your pass rate—your prior probability of having said "blue." As a function of that, in supervised learning, through cross-entropy loss, you would learn negative log P—P being pass rate—bits once you get this label. Whereas in RL, if you're just randomly guessing and seeing if it works or not, that's just going to be the entropy of a binary random variable.

So if you graph this, putting your pass rate on the x-axis and the bits you're learning from a sample on the y-axis... Okay, so with 0%, 50%, and 100% pass rate on the x-axis, supervised learning—negative log pass rate—would look something like this. And then the entropy of a binary random variable would look like this. If you're doing bits, it's one here at the peak. This is like a coin flip; you learn the most from a coin flip. That doesn't look too bad. This is supervised learning, and this is RL.

However, the problem is that you spend most of training in this regime, the low-pass-rate regime. If you chart the pass rate on a log scale—so at the beginning of training with a vocab size of 100K, the pass rate is 1 over 100,000, then 1 over 10,000, and so on—what the graph looks like is that supervised learning looks like this, and RL would look like that. And arguably, you spend all your time here, potentially never even getting a single success. It's a depressing plot in the sense that once you're here, it's not at all obvious how you get to there. Once you're over here, you have something, but in many RL problems, you spend all the time in the beginning. So there's a question of how you initialize so you're at least at a non-zero pass rate.

One more thing I'd like to add about bits per sample that's relevant to any machine learning problem is there's a connection to soft targets and distillation. If you have access to the logits—not just the one-hot token answer—the entropy of this distribution is far, far higher than the one-hot. So there's way more information, more bits per sample, in a soft label. That's why distillation is so effective per sample; it's giving you way more information.

It would just be the entropy of this distribution. The entropy of the one-hot is zero, whereas the entropy of the soft label is the entropy equation. This is also why AlphaGo is quite beautiful. In AlphaGo, you don't train the policy network to imitate the MCTS action; you train it to imitate the MCTS distribution. But both of these are actually valid. If you wanted to do a scientific experiment on how important this dark knowledge distillation is, you could run an experiment where you retrain the policy network on the action MCTS selected, rather than the soft target.

The beautiful thing about AlphaGo is that it never has to deal with this problem.

One thing I really wanted to talk to you about is that you did a bunch of the research for this project through this kind of automated LLM coding assistant loop. There's an idea that if you fully automated AI research, you could have some sort of singularity. Obviously, we're not there yet, but to the extent that we have early indications of what this process might look like, I am curious about your observations about what the AI is good at, what it's not good at, what you think about this scenario's likelihood eventually, and what thoughts you have about this in general.

For sure. I think automated scientific research is one of the most exciting skills that frontier labs are developing right now. I think it's important for everyone who's doing any kind of research to get a good intuition of what it can do now and what it can't, and how the science process might work in the future once we're having AIs automating a lot of this investigation. In brief, I mostly use Opus 4.6 and 4.7 throughout working on this. What works is that the models can do a very good job of doing hyperparameter optimization. So in the past, people would come up with a search base of hyperparameters, like learning rate, weight decay, and maybe how many layers are in your network, and they would do a grid search or a Bayesian hyperparameter optimization approach, and then it would find some tuned parameters.

The really cool thing that automated coding can do now is that it can search a much more open-ended set of problems. It can say, "I've identified that the gradients are small on this layer, so let me change it up here. Let me rewrite the code so the data loader has a new augmentation I came up with. Let's try to find the best way to fit the constraints of the optimization problem." You end up with this much more flexible and high-level, almost like grad student–like, ability to just grind a performance metric. This can squeeze out quite a lot of performance. You can, on a fixed dataset with a fixed time budget, improve perplexity by quite a lot on a classification problem like LLMs or Go.

It is also fantastic now at executing any experiment. I have a Claude skill that I wrote called Experiment, where I give it a description of what I want it to plot. I just describe, "Here's the X-axis I want, here's the Y-axis. Answer this question for me." It'll run off and do all the experiments, compile the plot, make a report, and suggest what might have caused it or so forth. That's what works quite well today, and I think we can expect that these abilities will get better in the future. But it's also useful to know what it is not doing so well today. On my blog version of this tutorial, I have a plot of all the experiments I did, grouped in a tree where every node represents a failed, successful, or mixed experimental result, and then from there it branches off into a child, where it's the follow-on experiment. Occasionally, I'll rabbit-hole down a track like this off-policy MCTS relabeling, do a few experiments, and then realize it's probably not worth it, so then I'll jump to a completely different track. I call these things "rows."

What I find is that current closed models that the public can access today don't seem to be that great at selecting what the next experiment should be in a given track, and they don't seem to be able to step back and do the lateral thinking of, "Wait a minute, this track doesn't really make sense. Let's go back to first principles and think about what the bottleneck might be, or what are we trying to achieve?" Often, I had to catch infra bugs myself by prompting the right question to Claude to investigate, "What is causing this discrepancy?" And then it'll answer the question.

I think with Mythos-class models or Mythos++ models coming online, maybe this just completely changes, and these problems just fall to improved scaling. At the same time, I think there's a rich opportunity to develop RL environments that might incentivize this kind of lateral thinking. One of the motivations for setting up this Go environment was that Go captures a lot of very interesting research problems, often overlapping with LLMs or robotics, and yet it's very quick to verify. The outer loop is ultimately, "Does the agent do what I think it does?" You can check the outcome of a Go game quite easily. The inner loop involves all this research engineering around distributed systems, predicting whether an idea is going to work or not, predicting the difference a particular modification to your training algorithm might make. I think there's a rich library of subtasks and sub-environments that you can train an automated scientist to work on, with Go as a sort of outer verification loop that then once you acquire these skills, maybe you can apply them to other domains like biosciences or robotics.

Or automating AI research.

Which is the real crux, or the scary/incredible thing of just making AIs making future versions of AIs. You're suggesting the outer loop here could just be your win rate against KataGo, basically?

That's one of them. I think there's a lot of deeper questions that one could tackle. For example, let's say you have an idea on how to improve a scaling law compute multiplier. The outcome isn't necessarily, "I achieved the best Go bot ever." The outcome might just be, "Can I predict what the win rate of my Go bot will be?" Or, "Can I predict the scaling law plots that emerge from my idea?" But then you can verify that you haven't reward-hacked anything by using a very verifiable game like Go on the outer loop.

The other question is how stackable local improvements are in the attempt to get to a better result on the outer loop. I've heard rumors that at some AI labs, the thing that has gone wrong is that people will individually pursue good ideas, but those don't end up stacking well, and so the training run falls because of some weird interaction between two seemingly good ideas. Having a single top-down vision of how things should work is very important. Having worked at different AI labs and also playing around with parallel agents trying different ideas, what is your sense of how parallelizable AI innovation is?

Great question. I think the research taste for executing well on the bitter lesson is that you need to know how much the bitter lesson can buy you and how much is too much to ask for at any given moment. Of course, in the fullness of time, compute is the single most important determinant on how things work, and it's almost inevitable that as you scale up energy and compute and parameters, intelligence will just fall out of that. That's super beautiful, super profound. No algorithmic detail really matters beyond that.

But in the present day, we don't have infinite compute and parameters and arbitrarily good initialization, so we have to come up with heuristics that give us that. But these heuristics are probably somewhat redundant, so that's probably why you see this effect where a lot of these compute multipliers don't necessarily stack. They might have some correlated benefit. Three years down the line, when the Nvidia GPUs have gotten even stronger, maybe they stack even less well. At any given point in time, the benefit of any given compute multiplier is transitory, which is what I sort of suspected with the KataGo paper. There were many algorithmic ideas applied, and then you can see that with modern Blackwell GPUs and Ada-class GPUs that are much better than the V100-grade GPUs that that paper used, some of these algorithmic tricks to speed up convergence just don't matter so much compared to something else. I think that's a matter of taste in the present time.

How about the outer loop? How verifiable is making AI smarter? With Go, you do have this outer loop of win rate against the best open-source model out there. Even there, as you were saying, there are other outer loops of, "Did you discover a new phenomenon?" Which is actually very hard to—if you didn't know scaling laws were important, if you're back in—when was Chinchilla or Kaplan scaling laws released?

Twenty-eighteen.

Yeah, so if you're back in 2015, there's not an automated procedure one can easily imagine of knowing which paper is the scaling laws paper versus which is just another random plot. That even in the Go case is a hard-to-verify outer loop, and the whole idea of an outer loop is to have some backstop on improvement. But let alone for general AGI, where of course we have a bunch of these benchmarks, but there's a problem that we know the things we can measure, and we improve on the things we can measure, but we care about this broader ability to do economically useful work, which is not super easy to measure, at least until you automate everything. So there's a question of how good is the outer verification loop for AI self-improvement, and does that matter?

I'm going to give a non-rigorous argument, but one that I intuitively believe, which is that DeepMind, the AI research lab, they started with a focus on games. They used games as their outer loop, and then their researchers learned from the experience of solving games, and now they're working on LLMs. Presumably, there was some positive transfer from their time working on games like Atari, Go, and StarCraft that now helps them make good LLMs. I assume there's positive transfer in some regard, whether it's coding or general research ability or project management. All these things probably help them do well. If that's the case, why wouldn't it also be true for automated AI researchers? They should be able to positively transfer experience tackling quick-to-verify, quick-to-iterate-on environments to something more ambitious and economically useful, like automating drug discovery or so forth.

I don't know. Isn't the issue with, historically until Gemini 3 or whatever, a couple years ago people were saying, "Look, Google isn't catching up in LLMs because they're too tied to the old approach." There's gains, but there's also ways in which it actively hinders you.

The jury's still out. I think who knows if, you know, let's say currently Google is doing quite well. Who knows if the initialization on training on games is ultimately going to hobble their ability to be the winner in the long term. It's hard to say for sure. Likewise, who knows if the seeming late start was really just them pre-training for longer on how to scale up TPUs. They invested all their tech tree in getting TPUs to be good, which seemed not that useful in the short term, but in the long term it becomes maybe like a—so it's even hard for humans to reason about what the optimal research strategy should be, even with the data we have today.

Cool. We should let people know how they can find out more about this project, whether to fork it themselves, whether to check out your blog post where you do an excellent job explaining many of these ideas. Where do people go next?

Great. My website is evjang.com. There's a blog post that links to an interactive version of this tutorial. On my GitHub, where the username is just Eric Jang, there's an AutoGo repo that people can fork and reproduce the training results.

I also highly recommend people check out this blog post, \*As Rocks May Think\*, which we touched on some of the ideas in this conversation, but it's this grander thesis of what happens when you have thinking as a primitive in...

Computer science.

Exactly. I highly recommend people check out that blog post as well.

I encourage the audience to think about the relationship between thinking and Go, via MCTS and search, and how it relates to LLMs. I think there's something quite profound there and probably underexplored just because Go has been relatively underexplored compared to the boom in LLMs. It's not to say that I think we should have trees in our LLMs, but there is some very interesting duality between them, and you can do a lot of research on Go, MCTS, and reasoning with very small budgets, so that's very exciting.

Awesome, Eric. Thanks for doing this.

Thank you. It's an honor to be on the podcast.

Sweet. By the way, if you're listening to this on an audio platform, this is a blackboard lecture, so I highly recommend switching over to a video platform like YouTube, if you can, to look at the math and the graphs and the Go board.

Cool.

Awesome.

Thanks, Eric.

So Hrish, it's an honor.
