// MnemonicSystem.jsx — FULL COGNITIVE AUGMENTATION SYSTEM
// Route: /mnemonic-system | No new installs — pure React + Canvas
// Navbar entry: { name: 'Mnemonic System', path: '/mnemonic-system', icon: '🧠', color: '#a855f7' }

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── DOMAIN DATA ───────────────────────────────────────────────────────────────

const DOMAINS = [
  { id: 'aiml', label: 'AI / ML', icon: '🤖', color: '#a855f7' },
  { id: 'datascience', label: 'Data Science', icon: '📊', color: '#06b6d4' },
  { id: 'python', label: 'Python', icon: '🐍', color: '#10b981' },
  { id: 'mysql', label: 'MySQL', icon: '🗄️', color: '#f59e0b' },
  { id: 'iot', label: 'IoT', icon: '🌐', color: '#3b82f6' },
  { id: 'robotics', label: 'Robotics', icon: '🦾', color: '#ec4899' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#ef4444' },
  { id: 'techniques', label: '50+ Techniques', icon: '🏛️', color: '#8b5cf6' },
];

const CONCEPTS = {
  aiml: [
    { concept: 'Neural Network', mnemonic: 'CITY OF NEURONS', story: 'Imagine a city (network) where citizens (neurons) pass messages through roads (weights). Each citizen shouts louder or quieter based on importance — that\'s activation!', visual: '🏙️→⬡→⬡→⬡', aiDetail: 'Layers of weighted nodes with activation functions. Forward pass computes output, backward pass adjusts weights via gradient descent.', technique: 'Method of Loci', anchor: 'City=Network, Citizens=Neurons, Roads=Weights', color: '#a855f7' },
    { concept: 'LSTM', mnemonic: 'ELEPHANT WITH A NOTEBOOK', story: 'An elephant (long memory) carries a NOTEBOOK (cell state). It has 3 doors: FORGET door (rip pages), INPUT door (write new), OUTPUT door (read aloud). The notebook survives time — that\'s LSTM!', visual: '🐘📓🚪🚪🚪', aiDetail: 'Long Short-Term Memory: cell state + forget gate + input gate + output gate. Solves vanishing gradient. Used for sequences, time-series, NLP.', technique: 'Story + Peg', anchor: 'Elephant=LongMemory, Notebook=CellState, 3Doors=3Gates', color: '#8b5cf6' },
    { concept: 'ANN (Backpropagation)', mnemonic: 'TEACHER MARKING EXAM BACKWARDS', story: 'Teacher gives exam (forward pass), student gets score (loss). Teacher walks BACKWARDS through all students telling each: "your mistake caused THIS error" — that\'s backprop!', visual: '📝→❌→👩‍🏫←←←', aiDetail: 'Chain rule applied backwards through layers. dLoss/dWeight computed for each parameter. Optimizer (SGD/Adam) updates weights.', technique: 'Reverse Story', anchor: 'Forward=Exam, Loss=Score, Backprop=Teacher walking back', color: '#a855f7' },
    { concept: 'CNN', mnemonic: 'DETECTIVE WITH MAGNIFYING GLASS', story: 'Detective (filter/kernel) slides MAGNIFYING GLASS across crime scene photo (image). Each position: is there a suspect? Pooling = detective takes notes of only the HOTTEST spots.', visual: '🔍→🖼️→📋→🎯', aiDetail: 'Convolutional layers extract local features. Max/avg pooling reduces dimensionality. Fully-connected layers classify. Used for images.', technique: 'PAO', anchor: 'Filter=Magnifying glass, Stride=Steps, Pooling=Notes', color: '#06b6d4' },
    { concept: 'Transformer / Attention', mnemonic: 'SPOTLIGHT IN A THEATRE', story: 'In a play (sentence), a SPOTLIGHT (attention) shines on actors (words). But it can shine on MULTIPLE actors at once with different intensities — "The cat sat on the mat" → "cat" pays most attention to "sat".', visual: '🎭💡→Q·K/√d→softmax→V', aiDetail: 'Q·Kᵀ/√dk → softmax → V. Multi-head allows parallel attention. Self-attention = each word attends to all others.', technique: 'Visualization', anchor: 'Spotlight=Attention, Actors=Tokens, Intensity=Weight', color: '#f59e0b' },
    { concept: 'Gradient Descent', mnemonic: 'BLIND MAN ON A HILL', story: 'Blindfolded man stands on bumpy hill (loss landscape). He FEELS the slope under his feet and takes a tiny step DOWNHILL. Repeat millions of times — he reaches the valley (minimum loss).', visual: '⛰️→👨‍🦯→↘️→🏔️valley', aiDetail: 'θ = θ - α·∇L(θ). Learning rate α controls step size. SGD=one sample, Mini-batch=small group, Adam=adaptive steps.', technique: 'Kinesthetic Visualization', anchor: 'Hill=Loss, Slope=Gradient, Step=LearningRate', color: '#10b981' },
    { concept: 'Overfitting', mnemonic: 'STUDENT WHO MEMORIZED THE TEXTBOOK', story: 'Student memorizes EVERY answer from old papers (training data). Exam day: new questions — BLANK. Memorized, not learned. Dropout = randomly hiding pages so student must THINK.', visual: '📚→100%train→0%test', aiDetail: 'Model learns noise in training data. High variance. Fix: Dropout, Regularization (L1/L2), more data, early stopping.', technique: 'Analogy', anchor: 'Memorize=Overfit, New Questions=Test Data, Blank=Generalization Fail', color: '#ef4444' },
    { concept: 'Reinforcement Learning', mnemonic: 'DOG LEARNING TRICKS', story: 'Dog (agent) tries action in room (environment). Sits → cookie (reward +1). Barks loudly → scolded (reward -1). Over time dog builds a POLICY: "what to do in each situation for max cookies."', visual: '🐕→🎯→🍪→📈policy', aiDetail: 'Agent, Environment, State, Action, Reward, Policy (π). Q-Learning, SARSA, PPO, DQN. Exploration vs Exploitation.', technique: 'Story + Emotional', anchor: 'Dog=Agent, Room=Environment, Cookie=Reward, Trick=Policy', color: '#a855f7' },
    { concept: 'GAN', mnemonic: 'COUNTERFEITER vs DETECTIVE', story: 'FORGER (Generator) prints fake money. DETECTIVE (Discriminator) catches fakes. Forger improves. Detective improves. After 10,000 rounds — forger\'s money is indistinguishable. THAT is a trained GAN.', visual: '🖨️fake←→🕵️→better fake→better detective', aiDetail: 'Generator G maps noise→fake data. Discriminator D classifies real/fake. Minimax game: G minimizes, D maximizes log likelihood.', technique: 'Competitive Story', anchor: 'Forger=Generator, Detective=Discriminator, Round=Epoch', color: '#ec4899' },
    { concept: 'Embedding', mnemonic: 'PASSPORT FOR WORDS', story: 'Every word gets a PASSPORT (vector) with 300 stamps (dimensions). Words that travel to the same countries (contexts) have similar passports. "King" - "Man" + "Woman" = "Queen" passport.', visual: '📝→🛂→[0.2,-0.8,0.3...]→🗺️', aiDetail: 'Dense vector representation. Word2Vec, GloVe, BERT embeddings. Semantic similarity = cosine distance between vectors.', technique: 'Metaphor + Visual', anchor: 'Passport=Vector, Stamps=Dimensions, Similar Countries=Semantic Similarity', color: '#06b6d4' },
    { concept: 'Random Forest', mnemonic: 'VILLAGE ELECTION', story: '100 VILLAGERS (decision trees), each slightly different, each votes on a decision. Final answer = MAJORITY VOTE. No single villager can be wrong enough to ruin the election — wisdom of crowds!', visual: '🌲🌲🌲→🗳️→✅majority', aiDetail: 'Ensemble of decision trees. Bagging (bootstrap sampling) + feature randomness. Reduces variance. Each tree votes, majority wins.', technique: 'Social Story', anchor: 'Villager=Tree, Village=Forest, Vote=Prediction, Majority=Ensemble', color: '#10b981' },
    { concept: 'K-Means Clustering', mnemonic: 'PARTY SEATING PLAN', story: 'Party organizer throws 3 random COLOUR FLAGS in the room. Everyone walks to nearest flag. Organizer moves flags to CENTER of each group. Repeat. Eventually: perfect seating clusters!', visual: '🚩→👥→🚩center→👥→converge', aiDetail: 'Initialize k centroids. Assign each point to nearest centroid. Update centroids = mean of cluster. Repeat until convergence.', technique: 'Visual + Kinesthetic', anchor: 'Flags=Centroids, Guests=DataPoints, Walk=Assignment, Move=Update', color: '#f59e0b' },
    { concept: 'Activation Function (ReLU)', mnemonic: 'BOUNCER AT NIGHTCLUB', story: 'Club BOUNCER: negative number? STAY OUT (return 0). Positive number? COME IN (pass through unchanged). ReLU = bouncer who blocks all negatives, lets all positives through.', visual: '😠negative=0 | 😊positive=x', aiDetail: 'ReLU(x) = max(0,x). Non-linear. Efficient. Dying ReLU problem → Leaky ReLU. Sigmoid for binary output, Softmax for multiclass.', technique: 'Character Analogy', anchor: 'Bouncer=ReLU, BlockNegative=Zero, AllowPositive=Passthrough', color: '#a855f7' },
    { concept: 'Dropout', mnemonic: 'TEAM PRACTICE WITHOUT STARS', story: 'Football coach randomly BENCHES 50% of players each practice. Team learns to work WITHOUT any single star. Game day — all fit. No one is overrelied on. Network becomes robust!', visual: '⚽🚫random players→robust team', aiDetail: 'Randomly zero out p% neurons during training. Forces redundant representations. Prevents co-adaptation. At inference: scale by (1-p).', technique: 'Sports Analogy', anchor: 'Benched=Dropped, Random=Stochastic, Robust=Generalization', color: '#ef4444' },
  ],
  datascience: [
    { concept: 'Pandas DataFrame', mnemonic: 'MAGIC SPREADSHEET WITH SUPERPOWERS', story: 'Imagine Excel but it knows KARATE. Each row = one story. Each column = one trait. You can filter, merge, transform 10 million rows in one line. The panda does the heavy lifting.', visual: '🐼+📊=⚡', aiDetail: 'pd.DataFrame. .loc[] label-based, .iloc[] index-based. groupby(), merge(), apply(). Series = single column.', technique: 'Character Story', anchor: 'Panda=pd, Spreadsheet=DataFrame, Karate=Vectorized ops', color: '#06b6d4' },
    { concept: 'NumPy Array', mnemonic: 'ARMY OF NUMBERS IN FORMATION', story: 'ARMY (array) marches in perfect GRID formation (matrix). One command moves ALL soldiers simultaneously — broadcasting. No loops needed. 1000x faster than Python list.', visual: '💂💂💂 → one command → all move', aiDetail: 'np.array, ndarray. Broadcasting rules. Vectorized operations. Shape, reshape, dot product. Foundation of all ML libraries.', technique: 'Military Metaphor', anchor: 'Army=Array, Grid=Matrix, OneCommand=Broadcasting', color: '#10b981' },
    { concept: 'Correlation vs Causation', mnemonic: 'ICE CREAM AND DROWNING', story: 'Ice cream sales ↑ = drowning deaths ↑. Does ice cream CAUSE drowning? NO! Summer (hidden variable) causes BOTH. Always ask: what is the LURKING VARIABLE?', visual: '🍦≠💀 but ☀️→🍦 AND ☀️→💀', aiDetail: 'Pearson r measures linear correlation (-1 to 1). Confounding variables create spurious correlations. Randomized control trials establish causation.', technique: 'Absurd Example', anchor: 'IceCream/Drowning=SpuriousCorrelation, Summer=Confounder', color: '#f59e0b' },
    { concept: 'Normal Distribution', mnemonic: 'THE BELL OF AVERAGE LIFE', story: 'Stand in any crowd — MOST people are average height (middle of bell). Very few are giants or tiny. Bell rings loudest in the MIDDLE (mean). ±1σ = 68% of ALL people.', visual: '🔔 → 68% within ±1σ → 95% within ±2σ', aiDetail: 'μ=mean, σ=std dev. 68-95-99.7 rule. Z-score = (x-μ)/σ. Central Limit Theorem: sample means always normal.', technique: 'Physical Metaphor', anchor: 'Bell=NormalCurve, Ring Loudest=Mean, Spread=StdDev', color: '#06b6d4' },
    { concept: 'Feature Engineering', mnemonic: 'CHEF PREPARING INGREDIENTS', story: 'Raw vegetables (raw data) taste terrible. Chef (data scientist) CHOPS (bin), MIXES (combine features), SEASONS (normalize), REMOVES rotten ones (drop outliers). Same meal tastes amazing!', visual: '🥦raw→🔪chop→🍳cook→🍽️features', aiDetail: 'Normalization, encoding categoricals, creating interaction terms, PCA for dimensionality reduction. Garbage in = garbage out.', technique: 'Cooking Analogy', anchor: 'Chef=DataScientist, Chop=Transform, Season=Normalize', color: '#10b981' },
    { concept: 'Train/Test Split', mnemonic: 'EXAM PREP vs REAL EXAM', story: 'Study from TEXTBOOK (training set). Practice on OLD papers (validation). NEVER peek at final exam (test set) until submission. Peeking = data leakage = cheating = false accuracy.', visual: '📚train(70%) | 📝val(15%) | 🔒test(15%)', aiDetail: 'Stratified split preserves class distribution. K-fold cross-validation. Data leakage = catastrophic. Holdout set sacred.', technique: 'Educational Analogy', anchor: 'Textbook=Train, OldPapers=Val, FinalExam=Test, Peeking=Leakage', color: '#f59e0b' },
    { concept: 'Confusion Matrix', mnemonic: 'DOCTOR\'S DIAGNOSIS TABLE', story: '4 boxes: TRUE POSITIVE (sick, said sick ✅), FALSE POSITIVE (healthy, said sick 😱), FALSE NEGATIVE (sick, said healthy ☠️), TRUE NEGATIVE (healthy, said healthy ✅). Precision=doctor\'s confidence. Recall=doctor\'s sensitivity.', visual: '🏥: TP✅|FP😱|FN☠️|TN✅', aiDetail: 'Precision=TP/(TP+FP). Recall=TP/(TP+FN). F1=harmonic mean. ROC-AUC plots TPR vs FPR.', technique: 'Medical Story', anchor: 'TP=Correct sick, FP=False alarm, FN=Missed, TN=Correct healthy', color: '#ef4444' },
    { concept: 'Matplotlib Visualization', mnemonic: 'PAINTER\'S CANVAS', story: 'plt = your PAINTBRUSH. figure = CANVAS. ax = where you paint. plt.show() = GALLERY OPENING. Line chart = mountain range. Bar = city skyline. Scatter = stars.', visual: '🖌️plt.plot() | 🏙️plt.bar() | ⭐plt.scatter()', aiDetail: 'plt.figure(figsize=(w,h)). Axes, ticks, labels. Seaborn wraps matplotlib with statistical plots. Subplots for comparison.', technique: 'Art Metaphor', anchor: 'Paintbrush=plt, Canvas=figure, Gallery=plt.show()', color: '#06b6d4' },
  ],
  python: [
    { concept: 'List Comprehension', mnemonic: 'ROBOT FACTORY ASSEMBLY LINE', story: 'Factory robot: [MAKE item FOR item IN pile IF item is good]. One line = entire factory floor. No loops, no mess. Clean, fast, Pythonic.', visual: '🏭[x*2 for x in range(10) if x%2==0]', aiDetail: '[expression for item in iterable if condition]. Generator expression uses () — lazy evaluation. Dict/set comprehensions too.', technique: 'Factory Analogy', anchor: 'Robot=expression, Pile=iterable, IF=filter', color: '#10b981' },
    { concept: 'Decorators', mnemonic: 'GIFT WRAPPING A PRESENT', story: 'Function = GIFT. Decorator = WRAPPING PAPER. @log wraps function to print before/after. @timer wraps to measure time. Gift unchanged inside — just differently wrapped outside.', visual: '🎁function → 🎀@decorator → enhanced function', aiDetail: '@decorator syntax sugar for wrapper(func). Closures capture outer scope. functools.wraps preserves docstring. Used for logging, auth, caching.', technique: 'Gift Metaphor', anchor: 'Gift=Function, Wrapper=Decorator, @=WrapAction', color: '#f59e0b' },
    { concept: 'Generator / yield', mnemonic: 'MAGIC VENDING MACHINE', story: 'Normal function = cook ALL meals, serve on table (memory full). Generator = VENDING MACHINE: cook one meal ON DEMAND, pause, wait for next request. Memory stays empty!', visual: '🍱🍱🍱 vs 🎰one→pause→one→pause', aiDetail: 'yield pauses execution, returns value. next() resumes. Lazy evaluation. Perfect for large datasets. range() is a generator.', technique: 'Vending Machine Story', anchor: 'CookAll=NormalFunc, Vending=Generator, Pause=yield', color: '#10b981' },
    { concept: 'OOP — Classes', mnemonic: 'COOKIE CUTTER AND COOKIES', story: 'Class = COOKIE CUTTER (blueprint). Object = COOKIE (instance). __init__ = initial dough shape. Methods = what cookie can do (eat, crumble). self = "this specific cookie".', visual: '🍪cutter(class)→🍪🍪🍪instances', aiDetail: 'class MyClass: __init__(self), instance methods, class methods (@classmethod), static methods. Inheritance, polymorphism, encapsulation.', technique: 'Physical Analogy', anchor: 'Cutter=Class, Cookie=Object, Dough=__init__, self=this', color: '#3b82f6' },
    { concept: 'Try / Except', mnemonic: 'SAFETY NET UNDER TRAPEZE', story: 'Trapeze artist (code) swings fearlessly BECAUSE there\'s a NET below (except). try = the jump. except = the net catches specific fall types. finally = always land no matter what.', visual: '🎪try: jump | except: catch | finally: land', aiDetail: 'try/except/else/finally. Catch specific exceptions: ValueError, TypeError, FileNotFoundError. raise to re-throw. Custom exception classes.', technique: 'Circus Analogy', anchor: 'Jump=try, Net=except, AlwaysLand=finally', color: '#a855f7' },
    { concept: 'Lambda Functions', mnemonic: 'DISPOSABLE LIGHTER', story: 'Need fire ONCE? Use a LIGHTER (lambda). Need fire every day? Buy a STOVE (def function). Lambda = one-time use, anonymous, no name. lambda x: x*2 is a lighter.', visual: '🔥one-time: lambda x: x*2 | 🍳everyday: def double(x)', aiDetail: 'lambda args: expression. No statements, single expression. Used in map(), filter(), sorted(key=). Not for complex logic.', technique: 'Tool Analogy', anchor: 'Lighter=lambda, Stove=def, OneTime=anonymous', color: '#ef4444' },
  ],
  mysql: [
    { concept: 'SELECT / JOIN', mnemonic: 'LIBRARY SCAVENGER HUNT', story: 'SELECT = tell librarian WHAT you want. FROM = which SHELF. WHERE = only books with red covers. JOIN = COMBINE books from shelf A with matching books from shelf B using the same ISBN.', visual: '📚SELECT name FROM users JOIN orders ON users.id=orders.user_id', aiDetail: 'INNER JOIN=both match. LEFT JOIN=all left + matching right. OUTER JOIN=everything. ON specifies join condition. Avoid N+1 queries.', technique: 'Library Story', anchor: 'Librarian=SQL engine, Shelf=Table, ISBN=Foreign Key', color: '#f59e0b' },
    { concept: 'INDEX', mnemonic: 'BOOK INDEX AT THE BACK', story: 'Finding "gradient descent" in 1000-page book: scan EVERY page (no index) vs flip to INDEX, see "page 247", go directly. INDEX in MySQL = pre-sorted lookup table. O(log n) vs O(n).', visual: '📖noindex: scan all | 📑index: jump to page', aiDetail: 'B-Tree index default. EXPLAIN query shows if index used. Composite index order matters. Too many indexes slow writes.', technique: 'Physical Analogy', anchor: 'BookIndex=DBIndex, PageNumber=RowPointer, Alphabetical=BTree', color: '#f59e0b' },
    { concept: 'ACID Properties', mnemonic: 'BANK VAULT RULES', story: 'ATOMICITY: transfer money — ALL or NOTHING (no half-transfers). CONSISTENCY: balance never negative. ISOLATION: two transfers simultaneously — don\'t see each other\'s work. DURABILITY: power cut — transaction still committed.', visual: '🏦A=AllOrNothing | C=ValidState | I=NoSnooping | D=Permanent', aiDetail: 'BEGIN TRANSACTION...COMMIT/ROLLBACK. Isolation levels: READ UNCOMMITTED→SERIALIZABLE. InnoDB supports ACID. NoSQL often sacrifices some.', technique: 'Banking Story', anchor: 'Bank=DB, Transfer=Transaction, Vault=Durability', color: '#3b82f6' },
    { concept: 'GROUP BY + Aggregates', mnemonic: 'CLASS TEACHER TAKING ROLL', story: 'Teacher has 1000 students from 10 cities. GROUP BY city = SORT students by city into piles. COUNT(*) = count each pile. AVG(marks) = average marks per city pile. SUM = total fees per city.', visual: '👨‍🎓🏙️GROUP BY city | COUNT()=pile size | AVG()=average', aiDetail: 'SELECT city, COUNT(*), AVG(score) FROM students GROUP BY city HAVING AVG(score)>60. HAVING filters after grouping (WHERE is before).', technique: 'Classroom Story', anchor: 'Pile=Group, Count=CountStudents, HAVING=FilterGroups', color: '#10b981' },
    { concept: 'Normalization', mnemonic: 'DECLUTTERING YOUR HOME', story: 'Messy home (unnormalized): phone number stored in EVERY room (redundancy). 1NF: no repeating groups (one thing per drawer). 2NF: no partial dependencies. 3NF: no transitive dependencies. Marie Kondo database!', visual: '🏠messy→1NF→2NF→3NF→🎍clean', aiDetail: '1NF: atomic values, no repeats. 2NF: no partial dependency on composite key. 3NF: no transitive dependencies. BCNF stricter. Denormalize for read performance.', technique: 'Home Organizing Story', anchor: 'MessyHome=Unnormalized, Declutter=Normalize, Drawer=Attribute', color: '#ec4899' },
  ],
  iot: [
    { concept: 'Sensor → Cloud Pipeline', mnemonic: 'HUMAN NERVOUS SYSTEM', story: 'Your FINGER (sensor) touches hot pan → nerve (wire) → spinal cord (microcontroller) → brain (gateway) → consciousness (cloud) → DECISION (dashboard: move hand!). IoT = digital nervous system of the world.', visual: '🌡️sensor→🧠MCU→📡gateway→☁️cloud→📊dashboard', aiDetail: 'Sensors: temperature, motion, pressure. MCU: ESP32/Arduino. Protocol: MQTT (pub/sub). Gateway aggregates. Cloud: AWS IoT, Azure IoT Hub. Dashboard: Grafana.', technique: 'Body Metaphor', anchor: 'Finger=Sensor, SpinalCord=MCU, Brain=Gateway, Consciousness=Cloud', color: '#3b82f6' },
    { concept: 'MQTT Protocol', mnemonic: 'POST OFFICE WITH TOPICS', story: 'Publisher (ESP32 sensor) drops a letter in topic MAILBOX (home/temperature). Subscriber (dashboard) has subscribed to that mailbox. BROKER (post office) delivers. No need to know each other\'s address!', visual: '📬publisher→🏤broker→📮subscriber on "home/temp" topic', aiDetail: 'Publish-Subscribe pattern. Broker: Mosquitto, HiveMQ. Topics hierarchical: home/livingroom/temperature. QoS 0/1/2. Lightweight for constrained devices.', technique: 'Post Office Story', anchor: 'Publisher=Sensor, PostOffice=Broker, Mailbox=Topic, Subscriber=Dashboard', color: '#3b82f6' },
    { concept: 'ESP32 Architecture', mnemonic: 'SWISS ARMY KNIFE COMPUTER', story: 'ESP32 = Swiss army knife: WiFi blade, Bluetooth blade, 34 GPIO pins blade, ADC blade, PWM blade — all in one cheap chip the size of your thumb. Your IoT brain on ₹200.', visual: '🔧ESP32: WiFi+BT+GPIO+ADC+PWM+DAC+I2C+SPI', aiDetail: 'Dual-core Xtensa LX6, 240MHz, 4MB flash, 520KB SRAM. Supports MicroPython, Arduino IDE. ADC for analog sensors, GPIO for digital, I2C/SPI for modules.', technique: 'Tool Analogy', anchor: 'SwissKnife=ESP32, WiFiBlade=WiFi, GPIOBlade=DigitalPins', color: '#06b6d4' },
    { concept: 'Edge Computing', mnemonic: 'VILLAGE DOCTOR vs CITY HOSPITAL', story: 'City hospital (cloud) = best equipment but 2-hour drive. Village doctor (edge device) = not perfect but INSTANT. For heart attack — village doctor FIRST. Edge computing: process locally, send only important data to cloud.', visual: '🏥cloud(slow,full) vs 👨‍⚕️edge(fast,limited)', aiDetail: 'Process data at/near source. Reduce latency, bandwidth, privacy risk. Edge AI: TensorFlow Lite on Raspberry Pi. Fog computing = middle tier.', technique: 'Medical Analogy', anchor: 'VillageDoctor=Edge, CityHospital=Cloud, Emergency=LowLatency', color: '#f59e0b' },
  ],
  robotics: [
    { concept: 'Perception → Planning → Action', mnemonic: 'SOLDIER IN BATTLEFIELD', story: 'Soldier SEES enemy position (perception/sensors). THINKS best route to objective (planning/path algorithm). MOVES precisely to position (action/actuators). If blocked: loop again. Robot = perpetual soldier.', visual: '👁️perception→🧠planning→💪action→repeat', aiDetail: 'Perception: LiDAR, cameras, IMU. Localization: SLAM (Simultaneous Localization and Mapping). Planning: A*, RRT, Dijkstra. Control: PID controller. Actuation: servos, DC motors.', technique: 'Military Story', anchor: 'Soldier=Robot, See=Sensors, Think=Planning, Move=Actuators', color: '#ec4899' },
    { concept: 'PID Controller', mnemonic: 'DRIVER KEEPING LANE', story: 'Car drifts RIGHT (error). Driver steers LEFT immediately (Proportional). Remembers cumulative drift over time (Integral). Predicts future drift (Derivative). PID = experienced driver\'s instinct in math!', visual: '🚗drift→P(now)+I(history)+D(future)→correct', aiDetail: 'Output = Kp*e + Ki*∫e + Kd*de/dt. Proportional: current error. Integral: steady-state error. Derivative: predicts overshoot. Tune Kp,Ki,Kd.', technique: 'Driving Story', anchor: 'Drift=Error, Steer=Control, P=Now, I=History, D=Future', color: '#ef4444' },
    { concept: 'SLAM', mnemonic: 'BLINDFOLDED EXPLORER WITH CHALK', story: 'Explorer walks unknown cave BLINDFOLDED with chalk. Feels walls (sensors), draws map (mapping) while tracking own position (localization). Both happen simultaneously — like Roomba mapping your home first time!', visual: '🗺️+📍happening simultaneously = SLAM', aiDetail: 'Particle filters, EKF-SLAM, Graph-SLAM. ROS (Robot Operating System) provides SLAM packages. LiDAR gives point clouds. Used in autonomous vehicles, drones.', technique: 'Explorer Story', anchor: 'Blindfolded=Uncertainty, Chalk=Map, Position=Localization', color: '#ec4899' },
    { concept: 'Computer Vision (OpenCV)', mnemonic: 'ROBOT EYES MADE OF MATH', story: 'Camera takes photo. OpenCV DECOMPOSES it: find edges (Canny), find faces (Haar cascade), find objects (YOLO). Each pixel is just a number — robot sees the WORLD as a matrix of emotions (colors).', visual: '📷→matrix→Canny edges→YOLO boxes→🎯', aiDetail: 'BGR (not RGB) by default. Canny edge detection. HOG features. YOLO/SSD for object detection. HSV for color filtering. cv2.VideoCapture for webcam.', technique: 'Eye Metaphor', anchor: 'Robot eyes=Camera, Math=OpenCV, Colors=Numbers', color: '#3b82f6' },
  ],
  gaming: [
    { concept: 'Game Loop', mnemonic: 'HEARTBEAT OF THE GAME', story: 'Every 16ms (60fps): HEART beats once. FEEL user input (process events). THINK about new positions (update state). DRAW new frame (render). Repeat forever at 60bpm — that\'s a game loop!', visual: '❤️16ms: Input→Update→Render→Input→Update→Render', aiDetail: 'while running: handle_input(), update(dt), render(). Fixed timestep vs variable. Delta time for physics independence. requestAnimationFrame in WebGL.', technique: 'Heartbeat Metaphor', anchor: 'Heartbeat=GameLoop, Feel=Input, Think=Update, Draw=Render', color: '#ef4444' },
    { concept: 'State Machine', mnemonic: 'TRAFFIC LIGHT BRAIN', story: 'Traffic light has STATES: Red, Yellow, Green. Each state has RULES: Red→only go to Green after 60s. Green→only go to Yellow. No jumping Red→Yellow. NPC enemy: Idle→Patrol→Alert→Attack — same principle!', visual: '🚦Red→Green→Yellow→Red | NPC: 😴→🚶→😤→⚔️', aiDetail: 'States: current mode. Transitions: conditions to switch. FSM, HSM (hierarchical). Unity Animator uses state machines. Behavior Trees are more powerful variant.', technique: 'Traffic Light', anchor: 'TrafficLight=StateMachine, Red/Green=States, Timer=Transition', color: '#ef4444' },
    { concept: 'Physics Engine', mnemonic: 'GOD CONTROLLING GRAVITY', story: 'Physics engine plays GOD: every object has mass, velocity, collider. At each tick, GOD applies gravity, resolves collisions, adds friction. Your character doesn\'t "feel" gravity — GOD calculates and moves them.', visual: '⚡F=ma | collision response | friction | every 16ms', aiDetail: 'Rigidbody, Colliders, Forces. AABB collision detection. Impulse resolution. Box2D (2D), Bullet Physics, PhysX (Unity/Unreal). Integration: Euler, Verlet, RK4.', technique: 'God Metaphor', anchor: 'God=PhysicsEngine, Mass/Velocity=Properties, Gravity=Force', color: '#f59e0b' },
    { concept: 'XP / Level System', mnemonic: 'SPACED REPETITION IN DISGUISE', story: 'Game gives 10XP for easy task, 100XP for hard. XP = measure of neural GROWTH. Level up = new capabilities unlocked. Streak system = Spaced Repetition. Game designers ACCIDENTALLY invented the best learning system!', visual: '📈XP curve = Ebbinghaus in reverse!', aiDetail: 'Skill trees, progression curves. XP formula: threshold = base * level^exponent. Reward schedules (variable ratio = most addictive). Same as Duolingo streaks.', technique: 'Meta Revelation', anchor: 'XP=LearningProgress, LevelUp=MasteryThreshold, Streak=SpacedRep', color: '#10b981' },
    { concept: 'Procedural Generation', mnemonic: 'SEED GROWS A UNIVERSE', story: 'Minecraft world = ONE NUMBER (seed). That seed + algorithm = infinite unique mountains, caves, oceans. Your brain stores the SEED (key idea) and GENERATES details on demand — not memorizes every detail!', visual: '🌱seed(42)→algorithm→🗺️infinite world', aiDetail: 'Perlin/Simplex noise for terrain. L-systems for plants. WFC (Wave Function Collapse) for dungeons. Same seed = same world. Compression through generation.', technique: 'Seed Metaphor', anchor: 'Seed=CoreConcept, Algorithm=Understanding, World=Details', color: '#3b82f6' },
  ],
  techniques: [
    { concept: 'Method of Loci', mnemonic: '🏛️ MEMORY PALACE', story: 'Walk through a familiar building. Place each item to remember in a specific room. Recall = mentally walk through. Ancient Greeks used this for 3-hour speeches.', visual: '🏠Room1=item1 | Room2=item2 | Walk=Recall', aiEquiv: 'Neural Architecture / Spatial Indexing', color: '#a855f7' },
    { concept: 'PAO System', mnemonic: '🎭 PERSON-ACTION-OBJECT', story: 'Each number 00-99 = a Person doing an Action with an Object. 42=Einstein throwing a frisbee. 3 cards = 1 story. Used by memory champions for decks of cards.', visual: '42-13-07 = Einstein(P) throwing(A) a boot(O)', aiEquiv: 'Object Detection + Sequence Modeling', color: '#06b6d4' },
    { concept: 'Major System', mnemonic: '🔢 CONSONANT CODE', story: '0=S/Z, 1=T/D, 2=N, 3=M, 4=R, 5=L, 6=J/SH, 7=K/G, 8=F/V, 9=P/B. 314 = MaTe → "mate drinks pi". Numbers → words → images.', visual: '3.14159 = MaTeRLuB → story', aiEquiv: 'Tokenization + Phoneme Encoding', color: '#10b981' },
    { concept: 'Peg System', mnemonic: '📌 NUMBER SHAPES', story: '1=Candle, 2=Swan, 3=Handcuffs, 4=Sailboat, 5=Hook, 6=Elephant trunk, 7=Cliff, 8=Snowman, 9=Balloon. Fixed pegs = instant retrieval of ordered lists.', visual: '1🕯️ 2🦢 3⛓️ 4⛵ 5🎣 6🐘 7🏔️ 8⛄ 9🎈 0🥚', aiEquiv: 'Hash Table with fixed keys', color: '#f59e0b' },
    { concept: 'Story Linking (Chain)', mnemonic: '🔗 ABSURD STORY CHAIN', story: 'Items: apple, bicycle, moon, professor. Story: Apple rides bicycle to the moon, crashes into professor\'s telescope. MORE absurd = MORE memorable. Logic = forgettable. Absurdity = unforgettable.', visual: '🍎→🚲→🌙→👨‍🔬(crash!)', aiEquiv: 'Graph Neural Network / Linked List', color: '#ef4444' },
    { concept: 'Emotional Encoding', mnemonic: '❤️‍🔥 FEELINGS LOCK MEMORIES', story: 'You remember WHERE you were during major emotional events. Attach STRONG emotion to any concept. Fear: "If I forget gradient descent in interview, I lose job." Joy: "I LOVE how backprop is just chain rule!"', visual: '😱fear+concept = LOCKED memory 🔐', aiEquiv: 'Loss Weighting / Attention Mechanism', color: '#ec4899' },
    { concept: 'Spaced Repetition', mnemonic: '🔄 EBBINGHAUS HACK', story: 'Review on day 1, day 3, day 7, day 14, day 30, day 90. Each review RESETS the forgetting clock but the interval DOUBLES. Like compound interest for memories!', visual: '📈retention: review→↑ | wait→↓ | review→↑↑ | wait→↓(less)', aiEquiv: 'Gradient Descent with Learning Rate Schedule', color: '#3b82f6' },
    { concept: 'Mind Map', mnemonic: '🗺️ BRAIN DUMP TREE', story: 'Central topic = trunk. Main branches = major ideas. Sub-branches = details. Colors per branch. Images > words. Your brain thinks in ASSOCIATIONS not lists. Mind map = brain\'s native format.', visual: '🌳trunk(topic)→branch1→sub1a,sub1b', aiEquiv: 'Graph / Tree Data Structure', color: '#10b981' },
    { concept: 'Visualization', mnemonic: '🎬 MENTAL MOVIE', story: 'Don\'t just read "nucleus" — see a glowing BLUE BALL spinning in space. Don\'t think "recursion" — see MIRRORS facing each other, infinite smaller reflections. Make it 3D, vivid, moving, colorful.', visual: '📝text → 🎬IMAX mental movie', aiEquiv: 'Embedding / High-dimensional Representation', color: '#a855f7' },
    { concept: 'Chunking', mnemonic: '📦 PACKING SUITCASE', story: 'Phone: 9876543210. Hard to remember. Chunks: 98765 | 43210. Easier! Expert chess player sees not 32 pieces but 5-6 CHUNKS (known patterns). Chunking = compressing working memory slots.', visual: '9876543210 → 98765|43210 → 2 chunks', aiEquiv: 'Compression / Dimensionality Reduction', color: '#06b6d4' },
    { concept: 'Rhyme & Rhythm', mnemonic: '🎵 MUSIC FOR MEMORY', story: '"In 1492, Columbus sailed the ocean blue." Pure rhyme locks date AND event. Your brain evolved to track rhythm (heartbeats, walking). Set any fact to a beat — it sticks 10x longer.', visual: '🎶fact+rhythm=🔒locked memory', aiEquiv: 'Positional Encoding in Transformers', color: '#f59e0b' },
    { concept: 'Acrostics / Acronyms', mnemonic: '🔤 FIRST LETTER HOOKS', story: 'BODMAS: Brackets, Order, Division, Multiplication, Addition, Subtraction. ROY G BIV: rainbow colors. HOMES: Great Lakes. First letters = HOOKS that pull entire concepts out of memory.', visual: '🔤B=Brackets O=Order D=Division...', aiEquiv: 'Tokenization / Compression Keys', color: '#10b981' },
    { concept: 'Dual Coding', mnemonic: '🖼️+📝 DOUBLE TRACK', story: 'Draw a picture AND write the words SIMULTANEOUSLY. Image stored in visual cortex. Words in language areas. Two storage locations = two retrieval paths. Can\'t forget if one path blocked!', visual: '🧠visual path + 🗣️verbal path = 2× retention', aiEquiv: 'Multi-modal Learning / Ensemble', color: '#ef4444' },
    { concept: 'Teaching Effect (Feynman)', mnemonic: '👩‍🏫 EXPLAIN TO A 5-YEAR-OLD', story: 'Try explaining gradient descent to a child. Gaps in explanation = gaps in understanding. Teaching FORCES you to find those gaps and fill them. The act of teaching backpropagates through YOUR neural network!', visual: '👧"Why does the ball roll down?" → forces clarity', aiEquiv: 'Backpropagation through your own network', color: '#a855f7' },
    { concept: 'Kinesthetic Encoding', mnemonic: '🤸 BODY AS MEMORY PALACE', story: 'Assign concepts to body parts. Head = big picture. Chest = core algorithm. Hands = implementation. Feet = output. TOUCH each body part as you recall. Motor cortex = powerful memory store.', visual: '🧍Head=Concept | Chest=Algorithm | Hands=Code | Feet=Output', aiEquiv: 'Embodied Cognition / Motor Memory', color: '#06b6d4' },
    { concept: '3D Spatial Memory', mnemonic: '🌀 OBJECTS IN SPACE', story: 'Place concepts in SPECIFIC locations in a 3D room. LSTM gate at the window. Attention mechanism on the ceiling. Backprop on the floor. Walk around mentally — spatial memory is ancient and powerful.', visual: '🏠3D: each corner = one concept cluster', aiEquiv: 'Spatial Indexing / 3D Hash Map', color: '#3b82f6' },
    { concept: 'Elaborative Interrogation', mnemonic: '❓ WHY + HOW = DEEP ROOT', story: 'For every fact: ask WHY and HOW. "LSTM uses forget gate." WHY? "To discard irrelevant long-term info." HOW? "Sigmoid output (0-1) multiplied with cell state." Each WHY/HOW = deeper root.', visual: '📌fact → ❓why → ❓how → 🌳deep roots', aiEquiv: 'Recursive Feature Extraction', color: '#ec4899' },
    { concept: 'Interleaving', mnemonic: '🃏 SHUFFLE THE DECK', story: 'Don\'t study LSTM for 3 hours then CNN for 3 hours. Interleave: LSTM → CNN → LSTM → Transformer → CNN. Feels harder but creates STRONGER connections between concepts. Confusion = growth.', visual: '📚ABC|ABC|ABC >> A|B|C|A|B|C', aiEquiv: 'Stochastic Training / Data Augmentation', color: '#f59e0b' },
    { concept: 'Self-Testing', mnemonic: '💪 RETRIEVAL = PUSH-UP', story: 'Reading = watching workout videos. Testing yourself = DOING push-ups. Every time you RETRIEVE a memory you STRENGTHEN it. Struggle during recall = weight on the barbell = GROWTH.', visual: '📖read=0 strength | ✍️recall=💪muscle', aiEquiv: 'Gradient Descent: loss forces weight update', color: '#10b981' },
    { concept: 'Sleep Consolidation', mnemonic: '😴 BRAIN\'S SAVE BUTTON', story: 'During sleep, hippocampus REPLAYS today\'s learning to neocortex for long-term storage. No sleep = RAM full, won\'t save to SSD. 8 hours = overnight batch processing + memory consolidation.', visual: '😴hippocampus→🔄replay→neocortex💾saved', aiEquiv: 'Batch Normalization / Model Checkpointing', color: '#a855f7' },
    { concept: 'Walking & Exercise', mnemonic: '🏃 BDNF: BRAIN FERTILIZER', story: 'Exercise releases BDNF (Brain-Derived Neurotrophic Factor) — literal fertilizer for neurons. 20 min walk before study = 20% more retention. Your body IS your cognitive upgrade system.', visual: '🏃→BDNF→🧠neuron growth→📈retention', aiEquiv: 'Learning Rate Warmup / Data Augmentation', color: '#ef4444' },
    { concept: 'The 4-Hour Review Cycle', mnemonic: '⏰ MEMORY WINDOW HACK', story: 'Review within 4 hours of learning = 80% retention. Review 24 hours later = 70%. After 1 week = 60%. The WINDOW is open widest RIGHT AFTER learning. Use it or lose it!', visual: '⏰4hr→🔒80% | 24hr→70% | 1week→60%', aiEquiv: 'Time-Sensitive Learning Rate Schedule', color: '#06b6d4' },
    { concept: 'Multi-Sensory Encoding', mnemonic: '5️⃣ SENSES = 5 SAVE PATHS', story: 'Learning only by reading = 1 path to memory. Add SMELL (coffee while studying), SOUND (specific music), TOUCH (textured notebook), MOVEMENT (walk while reviewing) = 5 simultaneous paths. Cut one — 4 remain!', visual: '👁️+👂+👃+✋+🏃= 5× retrieval paths', aiEquiv: 'Multi-modal Neural Networks', color: '#3b82f6' },
    { concept: 'Priming', mnemonic: '🌅 READ TITLES BEFORE SLEEPING', story: 'Before sleep, READ only the headings of tomorrow\'s chapter. Brain PRIMES during sleep — builds scaffolding. Next day: content finds hooks ALREADY WAITING. Like pre-loading cache before the query.', visual: '📖titles only → 😴prime → 📖full read: easy!', aiEquiv: 'Transfer Learning / Fine-tuning on Pre-trained Model', color: '#f59e0b' },
    { concept: 'Contextual Tagging', mnemonic: '📍 WHERE + WHEN = ANCHOR', story: 'Study LSTM in a specific chair, at a specific time, with specific music. Context becomes an anchor. When you sit in that chair again — LSTM floods back. Context = retrieval cue.', visual: '☕+🎵+💺+📍= LSTM retrieval trigger', aiEquiv: 'Key-Value Attention: context as query', color: '#ec4899' },
  ],
};

// 50 techniques summary
const ALL_50_TECHNIQUES = [
  { num: '01', name: 'Method of Loci', category: 'Spatial', icon: '🏛️' },
  { num: '02', name: 'PAO System', category: 'Number', icon: '🎭' },
  { num: '03', name: 'Major System', category: 'Number', icon: '🔢' },
  { num: '04', name: 'Peg System', category: 'Number', icon: '📌' },
  { num: '05', name: 'Story Linking', category: 'Association', icon: '🔗' },
  { num: '06', name: 'Emotional Encoding', category: 'Emotional', icon: '❤️' },
  { num: '07', name: 'Spaced Repetition', category: 'Timing', icon: '🔄' },
  { num: '08', name: 'Mind Mapping', category: 'Visual', icon: '🗺️' },
  { num: '09', name: 'Visualization', category: 'Visual', icon: '🎬' },
  { num: '10', name: 'Chunking', category: 'Compression', icon: '📦' },
  { num: '11', name: 'Rhyme & Rhythm', category: 'Audio', icon: '🎵' },
  { num: '12', name: 'Acrostics', category: 'Verbal', icon: '🔤' },
  { num: '13', name: 'Dual Coding', category: 'Multi-modal', icon: '🖼️' },
  { num: '14', name: 'Feynman Technique', category: 'Teaching', icon: '👩‍🏫' },
  { num: '15', name: 'Kinesthetic Encoding', category: 'Body', icon: '🤸' },
  { num: '16', name: '3D Spatial Memory', category: 'Spatial', icon: '🌀' },
  { num: '17', name: 'Elaborative Interrogation', category: 'Deep', icon: '❓' },
  { num: '18', name: 'Interleaving', category: 'Timing', icon: '🃏' },
  { num: '19', name: 'Self-Testing / Recall', category: 'Active', icon: '💪' },
  { num: '20', name: 'Sleep Consolidation', category: 'Biological', icon: '😴' },
  { num: '21', name: 'Exercise (BDNF)', category: 'Biological', icon: '🏃' },
  { num: '22', name: '4-Hour Review Window', category: 'Timing', icon: '⏰' },
  { num: '23', name: 'Multi-Sensory Encoding', category: 'Multi-modal', icon: '5️⃣' },
  { num: '24', name: 'Priming', category: 'Preparation', icon: '🌅' },
  { num: '25', name: 'Contextual Tagging', category: 'Association', icon: '📍' },
  { num: '26', name: 'Body as Memory Palace', category: 'Body', icon: '🧍' },
  { num: '27', name: 'Ridiculous Exaggeration', category: 'Visual', icon: '🤪' },
  { num: '28', name: 'Character Substitution', category: 'Association', icon: '🦸' },
  { num: '29', name: 'Colour Coding', category: 'Visual', icon: '🌈' },
  { num: '30', name: 'Number Shape System', category: 'Number', icon: '🔷' },
  { num: '31', name: 'Journey Method', category: 'Spatial', icon: '🗺️' },
  { num: '32', name: 'Roman Room', category: 'Spatial', icon: '🏺' },
  { num: '33', name: 'Alphabet System', category: 'Verbal', icon: '🔡' },
  { num: '34', name: 'Linking/Association Chain', category: 'Association', icon: '⛓️' },
  { num: '35', name: 'Name-Face Association', category: 'Social', icon: '👤' },
  { num: '36', name: 'Analogy Method', category: 'Conceptual', icon: '⚖️' },
  { num: '37', name: 'Metaphor Mapping', category: 'Conceptual', icon: '🗺️' },
  { num: '38', name: 'Narrative Framework', category: 'Story', icon: '📖' },
  { num: '39', name: 'First Letter Method', category: 'Verbal', icon: '🅰️' },
  { num: '40', name: 'Phonetic Association', category: 'Audio', icon: '🔊' },
  { num: '41', name: 'Category Clustering', category: 'Organization', icon: '📂' },
  { num: '42', name: 'Hierarchical Outlining', category: 'Organization', icon: '📐' },
  { num: '43', name: 'Contrast Method', category: 'Conceptual', icon: '⚡' },
  { num: '44', name: 'Question-Answer Pairs', category: 'Active', icon: '❓' },
  { num: '45', name: 'Flashcard System', category: 'Active', icon: '🃏' },
  { num: '46', name: 'Concept Mapping', category: 'Visual', icon: '🕸️' },
  { num: '47', name: 'Cornell Notes Method', category: 'Organization', icon: '📓' },
  { num: '48', name: 'Pomodoro + Review', category: 'Timing', icon: '🍅' },
  { num: '49', name: 'Imagination Amplification', category: 'Visual', icon: '✨' },
  { num: '50', name: 'Whole-Brain Learning', category: 'Integrative', icon: '🧠' },
];

// ─── CANVAS PARTICLE FIELD ─────────────────────────────────────────────────────
function ParticleField({ color = '#a855f7', count = 60 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const psRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    psRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5, alpha: Math.random() * 0.5 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = psRef.current;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.strokeStyle = color + Math.floor((1 - d / 90) * 35).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.4; ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
          }
        }
      }
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0'); ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [color, count]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45 }} />;
}

// ─── ORBITAL VISUALIZER ────────────────────────────────────────────────────────
function OrbitalViz({ nodes, color, centerIcon, centerLabel, reverse = false }) {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const spin = () => { setAngle(a => (a + (reverse ? -0.25 : 0.25)) % 360); rafRef.current = requestAnimationFrame(spin); };
    rafRef.current = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reverse]);
  const R = 78;
  return (
    <div style={{ position: 'relative', width: 190, height: 190, flexShrink: 0 }}>
      <svg width={190} height={190} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={95} cy={95} r={R} fill="none" stroke={color + '18'} strokeWidth={1} strokeDasharray="4 6" />
        {nodes.map((n, i) => {
          const a = (angle + i * (360 / nodes.length)) * Math.PI / 180;
          const x = 95 + R * Math.cos(a), y = 95 + R * Math.sin(a);
          return <line key={i} x1={95} y1={95} x2={x} y2={y} stroke={color + '20'} strokeWidth={0.5} />;
        })}
      </svg>
      {nodes.map((n, i) => {
        const a = (angle + i * (360 / nodes.length)) * Math.PI / 180;
        const x = 95 + R * Math.cos(a), y = 95 + R * Math.sin(a);
        return (
          <div key={i} style={{ position: 'absolute', left: x - 18, top: y - 18, width: 36, height: 36, background: color + '18', border: `1px solid ${color}44`, borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 9, color }}>
            <span style={{ fontSize: 12 }}>{n.icon}</span>
            <span style={{ fontSize: 6.5, marginTop: 1, textAlign: 'center', lineHeight: 1.1 }}>{n.label}</span>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 46, height: 46, background: `radial-gradient(circle, ${color}66, ${color}18)`, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 0 16px ${color}55` }}>
        {centerIcon}
        <span style={{ fontSize: 7, color, marginTop: 1 }}>{centerLabel}</span>
      </div>
    </div>
  );
}

// ─── NEURAL NETWORK LIVE ANIMATOR ─────────────────────────────────────────────
function NeuralNetAnimator({ color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth, H = canvas.offsetHeight || 140;
    canvas.width = W * window.devicePixelRatio; canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const layers = [[3, 0.2], [5, 0.4], [4, 0.6], [5, 0.75], [2, 0.9]];
    const nodes = layers.map(([n, xRatio]) =>
      Array.from({ length: n }, (_, i) => ({ x: xRatio * W, y: (H / (n + 1)) * (i + 1) }))
    );

    const draw = () => {
      tRef.current += 0.03;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      // connections
      for (let l = 0; l < nodes.length - 1; l++) {
        nodes[l].forEach(from => {
          nodes[l + 1].forEach(to => {
            const pulse = (Math.sin(t + from.x * 0.05 + from.y * 0.03) + 1) / 2;
            ctx.beginPath();
            ctx.strokeStyle = color + Math.floor(pulse * 50 + 8).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.8;
            ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
          });
        });
      }

      // nodes
      nodes.forEach((layer, li) => {
        layer.forEach(n => {
          const pulse = (Math.sin(t * 1.2 + n.x * 0.04 + n.y * 0.05) + 1) / 2;
          const r = 5 + pulse * 3;
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = color + Math.floor(pulse * 180 + 40).toString(16).padStart(2, '0');
          ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = color + Math.floor(pulse * 60).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5; ctx.stroke();
        });
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [color]);

  return (
    <div style={{ padding: '0 0 4px' }}>
      <div style={{ fontSize: 12, letterSpacing: 2, color, marginBottom: 8 }}>LIVE NEURAL NETWORK — FORWARD PASS</div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 130, display: 'block', borderRadius: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginTop: 8, padding: '0 4px' }}>
        {['INPUT', 'HIDDEN 1', 'HIDDEN 2', 'HIDDEN 3', 'OUTPUT'].map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

// ─── FORGETTING CURVE ─────────────────────────────────────────────────────────
function ForgettingCurve({ color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth, H = canvas.offsetHeight || 110;
    canvas.width = W * window.devicePixelRatio; canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, W, H);

    // grid
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
      ctx.moveTo(0, H / 4 * i); ctx.lineTo(W, H / 4 * i); ctx.stroke();
    }

    // without
    ctx.beginPath(); ctx.strokeStyle = '#ef444466'; ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x++) {
      const t = x / W * 7;
      const y = H - (H * 0.82 * Math.exp(-0.65 * t) + H * 0.06);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // with spaced rep (multiple bumps)
    const reviews = [0, 0.12, 0.27, 0.46, 0.68, 0.88];
    ctx.beginPath(); ctx.strokeStyle = color + 'cc'; ctx.lineWidth = 2;
    for (let x = 0; x <= W; x++) {
      const t = x / W;
      const ri = reviews.filter(r => r <= t).length - 1;
      const rt = reviews[Math.max(0, ri)];
      const since = (t - rt) * 7;
      const ret = 0.88 * Math.exp(-0.38 * since);
      const y = H - Math.max(0.05, Math.min(0.93, ret)) * (H - 8) - 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    reviews.slice(1).forEach(r => {
      ctx.fillStyle = color + '88'; ctx.fillRect(r * W - 1, 0, 2, H);
    });

    ctx.fillStyle = '#ef4444aa'; ctx.font = '8px monospace';
    ctx.fillText('WITHOUT SYSTEM', 6, H - 8);
    ctx.fillStyle = color + 'cc';
    ctx.fillText('WITH SPACED REPETITION', 6, 14);
  }, [color]);

  return (
    <div>
      <div style={{ fontSize: 12, letterSpacing: 2, color, marginBottom: 8 }}>EBBINGHAUS FORGETTING CURVE</div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 110, display: 'block' }} />
    </div>
  );
}

// ─── CONCEPT CARD ─────────────────────────────────────────────────────────────
function ConceptCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const c = item.color || '#a855f7';
  return (
    <div onClick={() => setExpanded(e => !e)} style={{
      background: expanded ? `${c}10` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${expanded ? c + '55' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
      transition: 'all 0.3s', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 22, flexShrink: 0 }}>{item.visual?.split('→')[0]?.trim().slice(0, 2) || '⬡'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0' }}>{item.concept}</span>
            <span style={{ fontSize: 11, color: c, background: c + '18', border: `1px solid ${c}33`, padding: '2px 9px', borderRadius: 10, letterSpacing: 0.5 }}>
              {item.technique || item.aiEquiv?.split('/')[0] || 'TECHNIQUE'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>"{item.mnemonic}"</div>
        </div>
        <div style={{ fontSize: 16, color: c, opacity: 0.6 }}>{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${c}22`, paddingTop: 14 }}>
          <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.9, marginBottom: 14 }}>{item.story}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ background: c + '12', border: `1px solid ${c}33`, borderRadius: 8, padding: '8px 14px', fontSize: 13, color: c, fontFamily: 'monospace' }}>
              VISUAL: {item.visual}
            </div>
          </div>
          {item.aiDetail && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#64748b', marginBottom: 6 }}>TECHNICAL DEEP DIVE</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>{item.aiDetail}</div>
            </div>
          )}
          {item.anchor && (
            <div style={{ marginTop: 10, background: c + '0a', borderRadius: 8, padding: '10px 14px' }}>
              <span style={{ fontSize: 11, letterSpacing: 1, color: c, fontWeight: 700 }}>MEMORY ANCHOR: </span>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{item.anchor}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 50 TECHNIQUES GRID ────────────────────────────────────────────────────────
function TechniquesGrid({ color }) {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(ALL_50_TECHNIQUES.map(t => t.category))];
  const filtered = filter === 'All' ? ALL_50_TECHNIQUES : ALL_50_TECHNIQUES.filter(t => t.category === filter);
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === c ? color : 'rgba(255,255,255,0.08)'}`,
            background: filter === c ? color + '22' : 'transparent', color: filter === c ? color : '#94a3b8',
            cursor: 'pointer', fontSize: 12, letterSpacing: 0.5, fontFamily: 'inherit', transition: 'all 0.2s'
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
        {filtered.map((t, i) => (
          <div key={t.num} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, minWidth: 22 }}>#{t.num}</span>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600, lineHeight: 1.3 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 0.5 }}>{t.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DOMAIN VIZ CONFIGS ───────────────────────────────────────────────────────
const DOMAIN_ORBITALS = {
  aiml: {
    nodes: [
      { icon: '⬡', label: 'Neurons' }, { icon: '∇', label: 'Gradient' },
      { icon: '🔍', label: 'Attention' }, { icon: '📊', label: 'Loss' },
      { icon: '⚖️', label: 'Weights' }, { icon: '🔄', label: 'Backprop' },
    ],
    center: '🤖', centerLabel: 'AI CORE',
  },
  datascience: {
    nodes: [
      { icon: '🐼', label: 'Pandas' }, { icon: '🔢', label: 'NumPy' },
      { icon: '📈', label: 'Stats' }, { icon: '🎯', label: 'ML' },
      { icon: '🖌️', label: 'Visual' }, { icon: '🔔', label: 'Normal' },
    ],
    center: '📊', centerLabel: 'DATA',
  },
  python: {
    nodes: [
      { icon: '📦', label: 'Package' }, { icon: '🎁', label: 'Decorator' },
      { icon: '🎰', label: 'Generator' }, { icon: '🍪', label: 'Class' },
      { icon: '🎪', label: 'Try/Except' }, { icon: '🔥', label: 'Lambda' },
    ],
    center: '🐍', centerLabel: 'PYTHON',
  },
  mysql: {
    nodes: [
      { icon: '📚', label: 'SELECT' }, { icon: '📑', label: 'INDEX' },
      { icon: '🏦', label: 'ACID' }, { icon: '👨‍🎓', label: 'GROUP' },
      { icon: '🎍', label: 'Normal' }, { icon: '🔗', label: 'JOIN' },
    ],
    center: '🗄️', centerLabel: 'SQL',
  },
  iot: {
    nodes: [
      { icon: '🌡️', label: 'Sensor' }, { icon: '🧠', label: 'MCU' },
      { icon: '📡', label: 'Gateway' }, { icon: '☁️', label: 'Cloud' },
      { icon: '📬', label: 'MQTT' }, { icon: '🔧', label: 'ESP32' },
    ],
    center: '🌐', centerLabel: 'IoT',
  },
  robotics: {
    nodes: [
      { icon: '👁️', label: 'Perception' }, { icon: '🧠', label: 'Planning' },
      { icon: '💪', label: 'Action' }, { icon: '🚗', label: 'PID' },
      { icon: '🗺️', label: 'SLAM' }, { icon: '📷', label: 'Vision' },
    ],
    center: '🦾', centerLabel: 'ROBOT',
  },
  gaming: {
    nodes: [
      { icon: '❤️', label: 'Loop' }, { icon: '🚦', label: 'State' },
      { icon: '⚡', label: 'Physics' }, { icon: '📈', label: 'XP' },
      { icon: '🌱', label: 'Proc.Gen' }, { icon: '🎨', label: 'Render' },
    ],
    center: '🎮', centerLabel: 'GAME',
  },
  techniques: {
    nodes: [
      { icon: '🏛️', label: 'Loci' }, { icon: '🎭', label: 'PAO' },
      { icon: '🔄', label: 'Spaced' }, { icon: '❤️', label: 'Emotion' },
      { icon: '🎵', label: 'Rhyme' }, { icon: '👩‍🏫', label: 'Feynman' },
    ],
    center: '🧠', centerLabel: 'MEMORY',
  },
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MnemonicSystem() {
  const [activeDomain, setActiveDomain] = useState('aiml');
  const [activeTab, setActiveTab] = useState('concepts'); // concepts | techniques | viz | philosophy
  const [searchQ, setSearchQ] = useState('');
  const [revealed, setRevealed] = useState(true);

  const domain = DOMAINS.find(d => d.id === activeDomain);
  const color = domain.color;
  const concepts = CONCEPTS[activeDomain] || [];
  const orbital = DOMAIN_ORBITALS[activeDomain];

  const filteredConcepts = searchQ.trim()
    ? concepts.filter(c =>
        c.concept.toLowerCase().includes(searchQ.toLowerCase()) ||
        c.mnemonic?.toLowerCase().includes(searchQ.toLowerCase()) ||
        c.story?.toLowerCase().includes(searchQ.toLowerCase())
      )
    : concepts;

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 60);
    return () => clearTimeout(t);
  }, [activeDomain]);

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#e2e8f0', fontFamily: "'Courier New', Courier, monospace", position: 'relative', overflowX: 'hidden' }}>

      {/* BG particle layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticleField color={color} count={55} />
      </div>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${color}12 0%, transparent 65%)`, transition: 'background 1s', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '80px 16px 60px' }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color, marginBottom: 14, fontWeight: 700 }}>SEEKHOWITHRUA × COGNITIVE AUGMENTATION × 50+ SYSTEMS</div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,64px)', fontWeight: 900, letterSpacing: -1, lineHeight: 1.05, color: '#ffffff', marginBottom: 14 }}>
            🧠 MNEMONIC SYSTEM
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', letterSpacing: 1, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            AI/ML · Data Science · Python · MySQL · IoT · Robotics · Gaming — Each concept becomes a story your brain cannot forget
          </p>
        </div>

        {/* ── DOMAIN TABS ── */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {DOMAINS.map(d => (
            <button key={d.id} onClick={() => { setActiveDomain(d.id); setSearchQ(''); }} style={{
              padding: '9px 18px', borderRadius: 24,
              background: activeDomain === d.id ? `${d.color}25` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeDomain === d.id ? d.color + '66' : 'rgba(255,255,255,0.07)'}`,
              color: activeDomain === d.id ? d.color : '#94a3b8',
              cursor: 'pointer', fontSize: 14, fontWeight: activeDomain === d.id ? 700 : 400,
              letterSpacing: 0.5, fontFamily: 'inherit', transition: 'all 0.25s',
              boxShadow: activeDomain === d.id ? `0 0 12px ${d.color}22` : 'none',
            }}>
              {d.icon} {d.label}
            </button>
          ))}
        </div>

        {/* ── CONTENT TABS ── */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 4, maxWidth: 520 }}>
          {[['concepts', '⬡ Concepts + Mnemonics'], ['viz', '🌀 3D Visual'], ['techniques', '🏛️ All 50 Techniques'], ['philosophy', '🧘 Philosophy']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 9,
              background: activeTab === id ? `${color}22` : 'transparent',
              border: `1px solid ${activeTab === id ? color + '44' : 'transparent'}`,
              color: activeTab === id ? color : '#94a3b8',
              cursor: 'pointer', fontSize: 13, letterSpacing: 0.3,
              fontFamily: 'inherit', fontWeight: activeTab === id ? 700 : 400, transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* ── CONCEPTS TAB ── */}
        {activeTab === 'concepts' && (
          <div style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'none' : 'translateY(12px)', transition: 'all 0.35s' }}>
            {/* search */}
            <div style={{ marginBottom: 20, maxWidth: 400 }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={`Search ${domain.label} concepts...`}
                style={{ width: '100%', padding: '12px 18px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33`, borderRadius: 10, color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* neural net for aiml domain */}
            {activeDomain === 'aiml' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}22`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <NeuralNetAnimator color={color} />
              </div>
            )}

            {/* forgetting curve for techniques domain */}
            {activeDomain === 'techniques' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}22`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <ForgettingCurve color={color} />
              </div>
            )}

            <div style={{ fontSize: 13, color: '#64748b', letterSpacing: 2, marginBottom: 14 }}>
              {filteredConcepts.length} CONCEPTS — CLICK TO EXPAND MNEMONIC + STORY + TECH DETAILS
            </div>
            {filteredConcepts.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#334155', fontSize: 13 }}>No concepts found for "{searchQ}"</div>
            )}
            {filteredConcepts.map((item, i) => <ConceptCard key={item.concept + i} item={item} index={i} />)}
          </div>
        )}

        {/* ── VIZ TAB ── */}
        {activeTab === 'viz' && (
          <div style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.4s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
              {DOMAINS.map(d => {
                const orb = DOMAIN_ORBITALS[d.id];
                return (
                  <div key={d.id} onClick={() => setActiveDomain(d.id)} style={{
                    background: activeDomain === d.id ? `${d.color}10` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeDomain === d.id ? d.color + '44' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 16, padding: '20px', cursor: 'pointer', transition: 'all 0.3s',
                  }}>
                    <div style={{ fontSize: 13, letterSpacing: 2, color: d.color, marginBottom: 10, fontWeight: 700 }}>{d.icon} {d.label.toUpperCase()}</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <OrbitalViz nodes={orb.nodes} color={d.color} centerIcon={orb.center} centerLabel={orb.centerLabel} reverse={['mysql','iot'].includes(d.id)} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Focused orbital + comparison */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}33`, borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 14, letterSpacing: 2, color, marginBottom: 20, fontWeight: 700 }}>
                🧠 HUMAN BRAIN vs 🤖 {domain.label.toUpperCase()} — ARCHITECTURAL MAP
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color, letterSpacing: 2, marginBottom: 8 }}>HUMAN MEMORY</div>
                  <OrbitalViz nodes={[
                    { icon: '🏛️', label: 'Palace' }, { icon: '❤️', label: 'Emotion' },
                    { icon: '🎭', label: 'Story' }, { icon: '🔄', label: 'Spaced' },
                    { icon: '🎵', label: 'Rhythm' }, { icon: '🌀', label: 'Spatial' },
                  ]} color="#a855f7" centerIcon="🧠" centerLabel="MIND" />
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Creates meaning</div>
                </div>
                <div style={{ textAlign: 'center', alignSelf: 'center' }}>
                  <div style={{ fontSize: 32, opacity: 0.08, fontWeight: 900 }}>⇆</div>
                  <div style={{ fontSize: 11, color: '#475569', letterSpacing: 2 }}>BOTH<br/>PROCESS<br/>PATTERNS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color, letterSpacing: 2, marginBottom: 8 }}>{domain.label.toUpperCase()}</div>
                  <OrbitalViz nodes={orbital.nodes} color={color} centerIcon={orbital.center} centerLabel={orbital.centerLabel} reverse />
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Processes tokens</div>
                </div>
              </div>

              {/* Brain-ML parallel table */}
              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: `#a855f722`, padding: '10px 16px', fontSize: 13, color: '#a855f7', letterSpacing: 2, fontWeight: 700 }}>🧠 HUMAN</div>
                <div style={{ background: `${color}18`, padding: '10px 16px', fontSize: 13, color, letterSpacing: 2, fontWeight: 700 }}>🤖 {domain.label.toUpperCase()}</div>
                {[
                  ['Neurons firing', 'Matrix multiplication'],
                  ['Emotional weight', 'Loss function weight'],
                  ['Spaced repetition', 'Learning rate schedule'],
                  ['Memory Palace', 'Neural Architecture'],
                  ['Story Linking', 'Graph Neural Network'],
                  ['Chunking', 'Dimensionality Reduction'],
                  ['Sleep consolidation', 'Model checkpointing'],
                  ['Teaching others', 'Backpropagation'],
                ].map(([h, m], i) => (
                  <>
                    <div key={`h${i}`} style={{ background: '#a855f70c', padding: '10px 16px', fontSize: 13, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>🧠 {h}</div>
                    <div key={`m${i}`} style={{ background: `${color}08`, padding: '10px 16px', fontSize: 13, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>⚙️ {m}</div>
                  </>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TECHNIQUES TAB ── */}
        {activeTab === 'techniques' && (
          <div style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.4s' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}33`, borderRadius: 20, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 14, letterSpacing: 2, color, marginBottom: 8, fontWeight: 700 }}>🏛️ ALL 50 MNEMONIC TECHNIQUES — MASTER INDEX</div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 18 }}>Filter by category. Click any concept card in the Concepts tab to see techniques applied to real AI/ML concepts.</div>
              <TechniquesGrid color={color} />
            </div>

            {/* In-depth technique cards from CONCEPTS[techniques] */}
            <div style={{ fontSize: 14, letterSpacing: 2, color, marginBottom: 14, fontWeight: 700 }}>DEEP TECHNIQUE BREAKDOWNS WITH AI ANALOGUES</div>
            {CONCEPTS.techniques.map((item, i) => <ConceptCard key={item.concept + i} item={item} index={i} />)}
          </div>
        )}

        {/* ── PHILOSOPHY TAB ── */}
        {activeTab === 'philosophy' && (
          <div style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.4s' }}>
            {[
              { q: 'If AI can recall 500 billion tokens in milliseconds — what is YOUR edge?', a: 'Speed is lost. Meaning is yours. AI retrieves patterns. You create purpose. The question "why does this matter?" cannot be computed. It must be lived.', icon: '🧘', color: '#a855f7' },
              { q: 'What happens to professionals who refuse to upgrade their cognition?', a: 'In 2024: 47% of cognitive tasks can be automated. By 2030: 70%. The professionals who survive won\'t be the fastest — they\'ll be the ones who ask better questions, think in systems, and create meaning from chaos.', icon: '⚠️', color: '#ef4444' },
              { q: 'Is your memory a feature or a bug?', a: 'Human memory is not broken — it is SELECTIVE. It remembers emotional, meaningful, vivid experiences. The solution is not better hardware — it is learning to encode information the way your brain prefers: in stories, emotions, and 3D space.', icon: '🔬', color: '#10b981' },
              { q: 'How is spaced repetition the same as compound interest?', a: 'One review = one rupee invested. Review at optimal spacing = compound interest. After 6 reviews, that memory earns 10x return. Neglect the schedule = inflation eats your investment. Your mind is a portfolio.', icon: '📈', color: '#f59e0b' },
              { q: 'Machine stores data. Human creates meaning. What is the difference?', a: 'A database can store "mother" as 6 characters. You feel 26 years of emotion, sacrifice, love, memory, smell, warmth. That is irreproducible. The day AI can truly feel "mother" — is the day it becomes human. We are not there. And the gap is wider than you think.', icon: '❤️', color: '#ec4899' },
              { q: 'What is the real reason most people forget what they learn?', a: 'They never encoded it meaningfully. Reading is passive. The brain is not a camera — it is a meaning-making machine. Passive input → no encoding → no retrieval. The solution: make every concept a story. Every story has a place. Every place has emotion.', icon: '🏛️', color: '#06b6d4' },
            ].map((item, i) => (
              <div key={i} style={{
                background: `${item.color}08`, border: `1px solid ${item.color}28`,
                borderRadius: 16, padding: '22px 24px', marginBottom: 14,
                borderLeft: `4px solid ${item.color}`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0', marginBottom: 12, lineHeight: 1.5 }}>
                  "{item.q}"
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8 }}>{item.a}</div>
              </div>
            ))}

            {/* NLP Reprogramming */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}33`, borderRadius: 16, padding: 22, marginTop: 8 }}>
              <div style={{ fontSize: 14, letterSpacing: 2, color, marginBottom: 16, fontWeight: 700 }}>🔄 NLP MIND REPROGRAMMING — INSTALL NEW SCRIPTS</div>
              {[
                { old: '"I can\'t remember technical concepts"', new: '"My brain encodes any concept when I make it a story"', type: 'Belief Rewrite' },
                { old: '"AI will replace me"', new: '"AI is my tool. I direct. I create. I question."', type: 'Frame Shift' },
                { old: '"I need to memorize everything"', new: '"I need to understand deeply — memory follows understanding"', type: 'Strategy Shift' },
                { old: '"I forget after the exam"', new: '"Spaced repetition is my weapon against forgetting"', type: 'System Install' },
                { old: '"Learning ML is too hard"', new: '"Every ML concept is a human story seen in mathematics"', type: 'Reframe' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#ef4444', textDecoration: 'line-through', opacity: 0.7, marginBottom: 6 }}>{s.old}</div>
                    <div style={{ fontSize: 14, color, fontWeight: 700 }}>{s.new}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', border: '1px solid #334155', padding: '3px 10px', borderRadius: 12, letterSpacing: 1, whiteSpace: 'nowrap' }}>{s.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM PROGRESS */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.04)', zIndex: 100 }}>
        <div style={{ height: '100%', width: `${((DOMAINS.findIndex(d => d.id === activeDomain) + 1) / DOMAINS.length) * 100}%`, background: `linear-gradient(90deg, #a855f7, ${color})`, transition: 'all 0.4s' }} />
      </div>
    </div>
  );
}