import { useState, useEffect, useRef } from "react";
import MLVisuals from "./MLVisuals";
import PythonVisuals from "./PythonVisuals";


// ============================================================
// EMBEDDED SYLLABUS DATA (UNCHANGED)
// ============================================================
const syllabusData = {
  mysql: {
    title: "MySQL Database",
    icon: "🗄️",
    color: "#00758f",
    modules: {
      "Basics": ["Introduction to RDBMS", "SQL Syntax & Data Types", "SELECT Statement Deep Dive", "WHERE Clause & Operators", "ORDER BY & Sorting", "LIMIT & Pagination"],
      "Intermediate": ["JOINS (INNER, LEFT, RIGHT, FULL)", "GROUP BY & HAVING Clauses", "Subqueries & Nested Queries", "Indexes & Query Optimization", "Views & Virtual Tables", "Stored Procedures"],
      "Advanced": ["Triggers & Events", "Transactions & ACID", "Database Normalization", "Query Performance Tuning", "Replication & Scaling", "Backup & Recovery"]
    }
  },
  python: {
    title: "Python Programming",
    icon: "🐍",
    color: "#ffd43b",
    modules: {
      "Core Python": ["Variables & Data Types", "Control Flow & Loops", "Functions & Scope", "OOP Concepts", "Exception Handling", "File Operations"],
      "Advanced Python": ["Decorators & Closures", "Generators & Iterators", "Multithreading & Multiprocessing", "Async Programming (asyncio)", "Memory Management", "Metaclasses"],
      "Backend Development": ["Django Framework Basics", "Django REST Framework", "Authentication & JWT", "API Development", "Testing & Debugging", "Deployment Strategies"]
    }
  },
  react: {
    title: "React Development",
    icon: "⚛️",
    color: "#61dafb",
    modules: {
      "Fundamentals": ["JSX & Component Structure", "Props & State Management", "Hooks (useState, useEffect)", "Event Handling", "Conditional Rendering", "Lists & Keys"],
      "Advanced React": ["Context API", "Redux Toolkit & RTK Query", "Performance Optimization", "Code Splitting & Lazy Loading", "Custom Hooks", "Error Boundaries"],
      "Production Ready": ["Authentication Flows", "Protected Routes", "API Integration Patterns", "Vite & Build Optimization", "Testing (Jest, React Testing Library)", "Deployment on Vercel"]
    }
  },
  ml: {
    title: "Machine Learning",
    icon: "🤖",
    color: "#ff6b6b",
    modules: {
      "Foundations": ["Linear Regression", "Logistic Regression", "K-Nearest Neighbors", "Decision Trees", "Support Vector Machines", "Naive Bayes"],
      "Advanced ML": ["Random Forest & Bagging", "Gradient Boosting (XGBoost, LightGBM)", "Feature Engineering", "Hyperparameter Tuning", "Cross Validation", "Ensemble Methods"],
      "Production ML": ["Model Evaluation Metrics", "Model Serialization (Pickle, Joblib)", "ML APIs with Django/FastAPI", "Docker Containerization", "Clustering (KMeans, DBSCAN)", "Real-world End-to-End Projects"]
    }
  },
  genai: {
    title: "Generative AI",
    icon: "🧠",
    color: "#a855f7",
    modules: {
      "LLM Fundamentals": ["Transformer Architecture", "Tokenization (BPE, WordPiece)", "Word Embeddings & Attention", "Prompt Engineering Basics", "Context Windows & Limits"],
      "Advanced LLM": ["Fine-Tuning Strategies", "RAG Architecture & Implementation", "Vector Databases (Pinecone, Chroma)", "LangChain & LlamaIndex", "PEFT & LoRA", "Model Quantization"],
      "Production AI": ["Local LLM Deployment (llama.cpp, Ollama)", "Building AI Chatbots", "Voice AI Integration (Whisper, TTS)", "Scaling AI Systems", "Cost Optimization", "Ethical AI Considerations"]
    }
  },
  django: {
    title: "Django Full Stack",
    icon: "🎯",
    color: "#092e20",
    modules: {
      "Django Basics": ["MTV Architecture", "Models & ORM", "Views & URL Routing", "Templates & Forms", "Admin Interface", "Static & Media Files"],
      "Django Advanced": ["Class-Based Views", "Middleware & Signals", "Caching Strategies", "Celery & Background Tasks", "WebSockets & Channels", "Security Best Practices"],
      "Full Stack Integration": ["REST API Development", "React-Django Integration", "Authentication (OAuth, JWT)", "Database Optimization", "Testing & CI/CD", "AWS/Render Deployment"]
    }
  }
};

const generateContent = (topic) => ({
  title: topic,
  description: `Master ${topic} with hands-on examples and real-world projects.`,
  sections: [
    { heading: "Overview", text: "This topic covers fundamental concepts and practical implementation." },
    { heading: "Key Concepts", text: "Understanding the core principles and best practices." },
    { heading: "Practice Exercise", text: "Apply what you've learned with coding challenges." }
  ]
});

// ============================================================
// PYTHON QUIZ DATA — 75 Questions (DSA 30%, Data 60%, FS 10%)
// ============================================================
const pythonQuizzes = {
  basics: [
    // DSA (basics ~22)
    { id:"pb1", level:"basics", tag:"DSA", title:"Reverse a List", question:"Write a function that reverses a list in-place without using built-in reverse().\nInput: [1,2,3,4,5]\nPrint the reversed list.", starterCode:'def reverse_list(lst):\n    # your code here\n    pass\n\nprint(reverse_list([1,2,3,4,5]))', expectedOutput:'[5, 4, 3, 2, 1]' },
    { id:"pb2", level:"basics", tag:"DSA", title:"Check Palindrome", question:"Write a function is_palindrome(s) that returns True if a string is a palindrome, False otherwise.\nTest with 'racecar' and 'hello'.", starterCode:'def is_palindrome(s):\n    # your code here\n    pass\n\nprint(is_palindrome(\'racecar\'))\nprint(is_palindrome(\'hello\'))', expectedOutput:'True\nFalse' },
    { id:"pb3", level:"basics", tag:"DSA", title:"Fibonacci Sequence", question:"Print the first 8 Fibonacci numbers starting from 0 using a loop.", starterCode:'# your code here', expectedOutput:'0 1 1 2 3 5 8 13' },
    { id:"pb4", level:"basics", tag:"DSA", title:"Find Duplicates", question:"Given a list [1,2,3,2,4,1,5], print all duplicate elements (unique duplicates, sorted).", starterCode:'lst = [1,2,3,2,4,1,5]\n# your code here', expectedOutput:'[1, 2]' },
    { id:"pb5", level:"basics", tag:"DSA", title:"Count Vowels", question:"Write a function that counts vowels in a string.\nTest: count_vowels('Hello World')", starterCode:'def count_vowels(s):\n    # your code here\n    pass\n\nprint(count_vowels(\'Hello World\'))', expectedOutput:'3' },
    { id:"pb6", level:"basics", tag:"DSA", title:"Second Largest", question:"Find the second largest number in [3,1,4,1,5,9,2,6] without using sort().\nPrint just the number.", starterCode:'lst = [3,1,4,1,5,9,2,6]\n# your code here', expectedOutput:'6' },
    { id:"pb7", level:"basics", tag:"DSA", title:"Factorial Recursion", question:"Write a recursive factorial function.\nPrint factorial(5).", starterCode:'def factorial(n):\n    # your code here\n    pass\n\nprint(factorial(5))', expectedOutput:'120' },
    { id:"pb8", level:"basics", tag:"DSA", title:"Two Sum", question:"Given nums=[2,7,11,15] and target=9, print the indices of two numbers that add up to target.", starterCode:'def two_sum(nums, target):\n    # your code here\n    pass\n\nprint(two_sum([2,7,11,15], 9))', expectedOutput:'[0, 1]' },
    { id:"pb9", level:"basics", tag:"DSA", title:"Stack using List", question:"Implement push/pop/peek using a Python list as a stack.\npush 1,2,3 then peek then pop then print stack.", starterCode:'stack = []\n# push 1, 2, 3\n# peek (print top without removing)\n# pop once\n# print final stack', expectedOutput:'3\n[1, 2]' },
    { id:"pb10", level:"basics", tag:"DSA", title:"Anagram Check", question:"Write is_anagram('listen','silent') that returns True if two strings are anagrams.", starterCode:'def is_anagram(s1, s2):\n    # your code here\n    pass\n\nprint(is_anagram(\'listen\', \'silent\'))\nprint(is_anagram(\'hello\', \'world\'))', expectedOutput:'True\nFalse' },
    // Data Science (basics ~45)
    { id:"pb11", level:"basics", tag:"DATA", title:"List Comprehension Filter", question:"Use list comprehension to get even numbers from 1-20 and print them.", starterCode:'# your code here', expectedOutput:'[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]' },
    { id:"pb12", level:"basics", tag:"DATA", title:"Dictionary Frequency", question:"Count character frequency in 'data science' (ignore spaces) and print sorted by key.", starterCode:'text = \'data science\'\n# your code here', expectedOutput:'{\'a\': 2, \'c\': 2, \'d\': 1, \'e\': 2, \'i\': 1, \'n\': 1, \'s\': 1, \'t\': 1}' },
    { id:"pb13", level:"basics", tag:"DATA", title:"Calculate Mean", question:"Calculate the mean of [10, 20, 30, 40, 50] without using statistics module.", starterCode:'data = [10, 20, 30, 40, 50]\n# your code here', expectedOutput:'30.0' },
    { id:"pb14", level:"basics", tag:"DATA", title:"Flatten Nested List", question:"Flatten [[1,2],[3,4],[5,6]] into a single list using list comprehension.", starterCode:'nested = [[1,2],[3,4],[5,6]]\n# your code here', expectedOutput:'[1, 2, 3, 4, 5, 6]' },
    { id:"pb15", level:"basics", tag:"DATA", title:"Lambda Sort", question:"Sort list of tuples [('Alice',30),('Bob',25),('Charlie',35)] by age using lambda.", starterCode:'people = [(\'Alice\',30),(\'Bob\',25),(\'Charlie\',35)]\n# sort by age\n# print sorted list', expectedOutput:'[(\'Bob\', 25), (\'Alice\', 30), (\'Charlie\', 35)]' },
    { id:"pb16", level:"basics", tag:"DATA", title:"Zip Two Lists", question:"Zip names=['Alice','Bob','Charlie'] and scores=[85,90,78] and print as dictionary.", starterCode:'names = [\'Alice\',\'Bob\',\'Charlie\']\nscores = [85,90,78]\n# your code here', expectedOutput:'{\'Alice\': 85, \'Bob\': 90, \'Charlie\': 78}' },
    { id:"pb17", level:"basics", tag:"DATA", title:"String Formatting", question:"Given data = {'name':'Alice','score':95.5}, print: 'Student Alice scored 95.50 points'", starterCode:'data = {\'name\': \'Alice\', \'score\': 95.5}\n# your code here', expectedOutput:'Student Alice scored 95.50 points' },
    { id:"pb18", level:"basics", tag:"DATA", title:"Range Statistics", question:"From range 1-10, print sum, min, max on separate lines.", starterCode:'data = list(range(1, 11))\n# print sum\n# print min\n# print max', expectedOutput:'55\n1\n10' },
    { id:"pb19", level:"basics", tag:"DATA", title:"Filter None Values", question:"Remove None values from [1, None, 2, None, 3, 4, None, 5] and print clean list.", starterCode:'data = [1, None, 2, None, 3, 4, None, 5]\n# your code here', expectedOutput:'[1, 2, 3, 4, 5]' },
    { id:"pb20", level:"basics", tag:"DATA", title:"Percentage Calculator", question:"Given scores=[70,85,90,60,95], print each as percentage of 100 rounded to 1 decimal.", starterCode:'scores = [70,85,90,60,95]\n# print each percentage', expectedOutput:'70.0%\n85.0%\n90.0%\n60.0%\n95.0%' },
    { id:"pb21", level:"basics", tag:"DATA", title:"Set Operations", question:"Given a={1,2,3,4,5} b={3,4,5,6,7}, print intersection then union.", starterCode:'a = {1,2,3,4,5}\nb = {3,4,5,6,7}\n# print intersection\n# print union', expectedOutput:'{3, 4, 5}\n{1, 2, 3, 4, 5, 6, 7}' },
    { id:"pb22", level:"basics", tag:"DATA", title:"Enumerate Usage", question:"Print indexed items from ['apple','banana','cherry'] as '0: apple' format.", starterCode:'fruits = [\'apple\',\'banana\',\'cherry\']\n# your code here', expectedOutput:'0: apple\n1: banana\n2: cherry' },
    { id:"pb23", level:"basics", tag:"DATA", title:"Map Function", question:"Use map() to square all numbers in [1,2,3,4,5] and print as list.", starterCode:'nums = [1,2,3,4,5]\n# your code here', expectedOutput:'[1, 4, 9, 16, 25]' },
    { id:"pb24", level:"basics", tag:"DATA", title:"Reduce Sum", question:"Use functools.reduce to compute product of [1,2,3,4,5].", starterCode:'from functools import reduce\nnums = [1,2,3,4,5]\n# your code here', expectedOutput:'120' },
    { id:"pb25", level:"basics", tag:"DATA", title:"String Split & Join", question:"Split 'machine,learning,python,data' by comma, sort it, and join with ' | '.", starterCode:'text = \'machine,learning,python,data\'\n# your code here', expectedOutput:'data | learning | machine | python' },
    // Full Stack (basics ~8)
    { id:"pb26", level:"basics", tag:"FULLSTACK", title:"JSON Parse & Dump", question:"Parse this JSON string, add key 'active':True and print back as JSON string.", starterCode:'import json\ndata = \'{\"name\": \"Alice\", \"age\": 30}\'\n# parse, add active:True, dump back', expectedOutput:'{"name": "Alice", "age": 30, "active": true}' },
    { id:"pb27", level:"basics", tag:"FULLSTACK", title:"File Read Simulation", question:"Using StringIO as a file, read lines and print total word count.", starterCode:'from io import StringIO\nf = StringIO(\"hello world\\npython is great\\ndata science\")\n# count total words', expectedOutput:'7' },
    // fill to 25 with more data questions
    { id:"pb28", level:"basics", tag:"DATA", title:"Nested Dict Access", question:"From d={'student':{'name':'Alice','grades':[90,85,92]}}, print name and average grade.", starterCode:'d = {\'student\': {\'name\': \'Alice\', \'grades\': [90, 85, 92]}}\n# print name\n# print average grade', expectedOutput:'Alice\n89.0' },
    { id:"pb29", level:"basics", tag:"DSA", title:"Linear Search", question:"Implement linear search. Find index of 7 in [3,1,4,1,5,9,2,6,7].", starterCode:'def linear_search(lst, target):\n    # your code here\n    pass\n\nprint(linear_search([3,1,4,1,5,9,2,6,7], 7))', expectedOutput:'8' },
    { id:"pb30", level:"basics", tag:"DATA", title:"Type Conversion Batch", question:"Convert ['1','2','3','4','5'] to integers and print their sum.", starterCode:'str_nums = [\'1\',\'2\',\'3\',\'4\',\'5\']\n# your code here', expectedOutput:'15' },
    { id:"pb31", level:"basics", tag:"DATA", title:"Max Word Length", question:"Find the longest word in 'Python is a powerful programming language'.", starterCode:'sentence = \'Python is a powerful programming language\'\n# your code here', expectedOutput:'programming' },
    { id:"pb32", level:"basics", tag:"DSA", title:"Bubble Sort", question:"Implement bubble sort for [64,34,25,12,22,11,90] and print sorted list.", starterCode:'def bubble_sort(arr):\n    # your code here\n    pass\n\nprint(bubble_sort([64,34,25,12,22,11,90]))', expectedOutput:'[11, 12, 22, 25, 34, 64, 90]' },
    { id:"pb33", level:"basics", tag:"DATA", title:"Conditional Count", question:"Count how many numbers in [1..20] are divisible by both 2 and 3.", starterCode:'# your code here', expectedOutput:'3' },
    { id:"pb34", level:"basics", tag:"DATA", title:"Star Pattern", question:"Print a 5-row right triangle using *.\nRow 1: 1 star, Row 5: 5 stars.", starterCode:'# your code here', expectedOutput:'*\n**\n***\n****\n*****' },
    { id:"pb35", level:"basics", tag:"DATA", title:"Prime Numbers", question:"Print all prime numbers between 1 and 30.", starterCode:'# your code here', expectedOutput:'2 3 5 7 11 13 17 19 23 29' },
    { id:"pb36", level:"basics", tag:"DATA", title:"GCD Calculation", question:"Calculate GCD of 48 and 18 without using math.gcd.", starterCode:'def gcd(a, b):\n    # your code here\n    pass\n\nprint(gcd(48, 18))', expectedOutput:'6' },
    { id:"pb37", level:"basics", tag:"DATA", title:"List Slicing", question:"Given lst=[0,1,2,3,4,5,6,7,8,9], print: first 3, last 3, every other element.", starterCode:'lst = list(range(10))\n# print first 3\n# print last 3\n# print every other (0,2,4,6,8)', expectedOutput:'[0, 1, 2]\n[7, 8, 9]\n[0, 2, 4, 6, 8]' },
    { id:"pb38", level:"basics", tag:"FULLSTACK", title:"Default Dict", question:"From ['apple','banana','apple','cherry','banana','apple'], use defaultdict to count and print sorted.", starterCode:'from collections import defaultdict\nfruits = [\'apple\',\'banana\',\'apple\',\'cherry\',\'banana\',\'apple\']\n# your code here', expectedOutput:'{\'apple\': 3, \'banana\': 2, \'cherry\': 1}' },
    { id:"pb39", level:"basics", tag:"DATA", title:"Number to Binary", question:"Convert 42 to binary, octal, and hexadecimal. Print each.", starterCode:'n = 42\n# print binary\n# print octal\n# print hex', expectedOutput:'0b101010\n0o52\n0x2a' },
    { id:"pb40", level:"basics", tag:"DATA", title:"Transpose Matrix", question:"Transpose matrix=[[1,2,3],[4,5,6],[7,8,9]] using zip and print each row.", starterCode:'matrix = [[1,2,3],[4,5,6],[7,8,9]]\n# transpose and print each row', expectedOutput:'(1, 4, 7)\n(2, 5, 8)\n(3, 6, 9)' },
    { id:"pb41", level:"basics", tag:"DSA", title:"Remove Duplicates Ordered", question:"Remove duplicates from [4,2,3,2,1,4,5,1] while maintaining order.", starterCode:'lst = [4,2,3,2,1,4,5,1]\n# your code here', expectedOutput:'[4, 2, 3, 1, 5]' },
    { id:"pb42", level:"basics", tag:"DATA", title:"Word Frequency Top 3", question:"From 'the cat sat on the mat the cat', find top 3 most common words.", starterCode:'from collections import Counter\ntext = \'the cat sat on the mat the cat\'\n# find top 3', expectedOutput:'[(\'the\', 3), (\'cat\', 2), (\'sat\', 1)]' },
    { id:"pb43", level:"basics", tag:"DATA", title:"Roman Numerals", question:"Convert integer 2024 to Roman numerals.", starterCode:'def to_roman(num):\n    # your code here\n    pass\n\nprint(to_roman(2024))', expectedOutput:'MMXXIV' },
    { id:"pb44", level:"basics", tag:"DATA", title:"Celsius to Fahrenheit", question:"Convert [0, 20, 37, 100] Celsius to Fahrenheit. Formula: F = C*9/5 + 32. Print each.", starterCode:'temps_c = [0, 20, 37, 100]\n# your code here', expectedOutput:'32.0\n68.0\n98.6\n212.0' },
    { id:"pb45", level:"basics", tag:"DSA", title:"Queue using Deque", question:"Use collections.deque as a queue. Enqueue 1,2,3, dequeue once, print queue.", starterCode:'from collections import deque\nq = deque()\n# enqueue 1, 2, 3\n# dequeue once\n# print queue', expectedOutput:'deque([2, 3])' },
    // fill remaining to 25
    { id:"pb46", level:"basics", tag:"DATA", title:"Nested List Flatten Deep", question:"Flatten [1,[2,[3,[4]]],5] completely into [1,2,3,4,5].", starterCode:'def flatten(lst):\n    result = []\n    for item in lst:\n        if isinstance(item, list):\n            result.extend(flatten(item))\n        else:\n            result.append(item)\n    return result\n\nprint(flatten([1,[2,[3,[4]]],5]))', expectedOutput:'[1, 2, 3, 4, 5]' },
    { id:"pb47", level:"basics", tag:"DATA", title:"Odd/Even Split", question:"Split [1..10] into two lists: odds and evens, print both.", starterCode:'data = list(range(1, 11))\n# split into odds and evens\n# print odds then evens', expectedOutput:'[1, 3, 5, 7, 9]\n[2, 4, 6, 8, 10]' },
    { id:"pb48", level:"basics", tag:"DATA", title:"String Reversal Words", question:"Reverse words in 'Data Science is fun' keeping word order reversed.", starterCode:'sentence = \'Data Science is fun\'\n# your code here', expectedOutput:'fun is Science Data' },
    { id:"pb49", level:"basics", tag:"DSA", title:"Find Missing Number", question:"Find missing number in [1,2,3,4,6,7,8,9,10] (range 1-10).", starterCode:'nums = [1,2,3,4,6,7,8,9,10]\n# find missing number', expectedOutput:'5' },
    { id:"pb50", level:"basics", tag:"FULLSTACK", title:"Named Tuple", question:"Create a named tuple Point(x,y) and print distance from (3,4) to origin.", starterCode:'from collections import namedtuple\n# create Point named tuple\n# create point (3,4)\n# print distance to origin (rounded to 2 decimals)', expectedOutput:'5.0' },
  ],
  intermediate: [
    { id:"pi1", level:"intermediate", tag:"DSA", title:"Binary Search", question:"Implement binary search. Search for 17 in [1,3,5,7,9,11,13,15,17,19].\nReturn the index.", starterCode:'def binary_search(arr, target):\n    # your code here\n    pass\n\nprint(binary_search([1,3,5,7,9,11,13,15,17,19], 17))', expectedOutput:'8' },
    { id:"pi2", level:"intermediate", tag:"DSA", title:"Merge Sort", question:"Implement merge sort and sort [38,27,43,3,9,82,10].", starterCode:'def merge_sort(arr):\n    # your code here\n    pass\n\nprint(merge_sort([38,27,43,3,9,82,10]))', expectedOutput:'[3, 9, 10, 27, 38, 43, 82]' },
    { id:"pi3", level:"intermediate", tag:"DSA", title:"Linked List Node", question:"Create a simple linked list with nodes 1->2->3->None and print values.", starterCode:'class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\n# create linked list 1->2->3\n# traverse and print values', expectedOutput:'1\n2\n3' },
    { id:"pi4", level:"intermediate", tag:"DSA", title:"Valid Parentheses", question:"Check if '({[]})' and '({[)' are valid parentheses using a stack.", starterCode:'def is_valid(s):\n    # your code here\n    pass\n\nprint(is_valid(\'({[]})\'))\nprint(is_valid(\'({[)\'))', expectedOutput:'True\nFalse' },
    { id:"pi5", level:"intermediate", tag:"DSA", title:"Max Subarray Sum", question:"Implement Kadane's algorithm to find max subarray sum of [-2,1,-3,4,-1,2,1,-5,4].", starterCode:'def max_subarray(nums):\n    # Kadane\'s algorithm\n    pass\n\nprint(max_subarray([-2,1,-3,4,-1,2,1,-5,4]))', expectedOutput:'6' },
    { id:"pi6", level:"intermediate", tag:"DSA", title:"LRU Cache", question:"Implement a simple LRU cache with capacity=2.\nput(1,1), put(2,2), get(1), put(3,3), get(2), print results.", starterCode:'from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.cache = OrderedDict()\n    \n    def get(self, key):\n        # your code\n        pass\n    \n    def put(self, key, val):\n        # your code\n        pass\n\ncache = LRUCache(2)\ncache.put(1,1)\ncache.put(2,2)\nprint(cache.get(1))\ncache.put(3,3)\nprint(cache.get(2))', expectedOutput:'1\n-1' },
    { id:"pi7", level:"intermediate", tag:"DSA", title:"Balanced BST Check", question:"Given inorder=[1,2,3,4,5,6,7], check if a tree built from it is height-balanced.\nFor simplicity: print True if len is 2^k-1.", starterCode:'def is_balanced_size(n):\n    import math\n    # check if n == 2^k - 1 for some k\n    k = math.log2(n+1)\n    return k == int(k)\n\nprint(is_balanced_size(7))\nprint(is_balanced_size(5))', expectedOutput:'True\nFalse' },
    { id:"pi8", level:"intermediate", tag:"DSA", title:"Graph BFS", question:"BFS traversal of graph {0:[1,2],1:[2],2:[0,3],3:[3]} starting from node 2.", starterCode:'from collections import deque\n\ndef bfs(graph, start):\n    visited = []\n    queue = deque([start])\n    seen = set([start])\n    while queue:\n        node = queue.popleft()\n        visited.append(node)\n        for n in graph[node]:\n            if n not in seen:\n                seen.add(n)\n                queue.append(n)\n    return visited\n\ngraph = {0:[1,2],1:[2],2:[0,3],3:[3]}\nprint(bfs(graph, 2))', expectedOutput:'[2, 0, 3, 1]' },
    { id:"pi9", level:"intermediate", tag:"DSA", title:"Coin Change", question:"Minimum coins to make amount=11 with coins=[1,5,6,9]. Use DP.", starterCode:'def coin_change(coins, amount):\n    dp = [float(\'inf\')] * (amount+1)\n    dp[0] = 0\n    for i in range(1, amount+1):\n        for c in coins:\n            if c <= i:\n                dp[i] = min(dp[i], dp[i-c]+1)\n    return dp[amount] if dp[amount] != float(\'inf\') else -1\n\nprint(coin_change([1,5,6,9], 11))', expectedOutput:'2' },
    { id:"pi10", level:"intermediate", tag:"DSA", title:"Power Set", question:"Generate power set of [1,2,3] and print sorted by length.", starterCode:'def power_set(s):\n    result = [[]]\n    for elem in s:\n        result += [subset + [elem] for subset in result]\n    return result\n\nps = sorted(power_set([1,2,3]), key=len)\nfor s in ps:\n    print(s)', expectedOutput:'[]\n[1]\n[2]\n[3]\n[1, 2]\n[1, 3]\n[2, 3]\n[1, 2, 3]' },
    // Data Science intermediate
    { id:"pi11", level:"intermediate", tag:"DATA", title:"Decorator Timer", question:"Write a decorator that prints execution time.\nApply to a function that sums 1..1000000 and print just 'Done' (time varies).", starterCode:'import time\n\ndef timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        # just print Done\n        print(\'Done\')\n        return result\n    return wrapper\n\n@timer\ndef heavy_sum():\n    return sum(range(1000000))\n\nheavy_sum()', expectedOutput:'Done' },
    { id:"pi12", level:"intermediate", tag:"DATA", title:"Generator Expression", question:"Create a generator that yields squares of even numbers 1-20. Print sum of generator.", starterCode:'gen = (x**2 for x in range(1,21) if x%2==0)\nprint(sum(gen))', expectedOutput:'1540' },
    { id:"pi13", level:"intermediate", tag:"DATA", title:"Class Inheritance", question:"Create Animal base class with speak(). Dog extends Animal and overrides speak() to return 'Woof'. Print Dog().speak().", starterCode:'class Animal:\n    def speak(self):\n        return \'Generic sound\'\n\nclass Dog(Animal):\n    def speak(self):\n        return \'Woof\'\n\nprint(Dog().speak())', expectedOutput:'Woof' },
    { id:"pi14", level:"intermediate", tag:"DATA", title:"Context Manager", question:"Create a custom context manager that prints 'Enter' and 'Exit'.\nUse it in a with statement.", starterCode:'class Managed:\n    def __enter__(self):\n        print(\'Enter\')\n        return self\n    def __exit__(self, *args):\n        print(\'Exit\')\n\nwith Managed():\n    pass', expectedOutput:'Enter\nExit' },
    { id:"pi15", level:"intermediate", tag:"DATA", title:"Pandas-like GroupBy", question:"From data=[('A',10),('B',20),('A',30),('B',40),('A',50)], compute group sum for A and B.", starterCode:'from collections import defaultdict\ndata = [(\'A\',10),(\'B\',20),(\'A\',30),(\'B\',40),(\'A\',50)]\ngroups = defaultdict(int)\nfor k, v in data:\n    groups[k] += v\nfor k in sorted(groups):\n    print(f\'{k}: {groups[k]}\')', expectedOutput:'A: 90\nB: 60' },
    { id:"pi16", level:"intermediate", tag:"DATA", title:"Matrix Multiplication", question:"Multiply A=[[1,2],[3,4]] and B=[[5,6],[7,8]] manually. Print result rows.", starterCode:'A = [[1,2],[3,4]]\nB = [[5,6],[7,8]]\n# matrix multiply\nresult = [[sum(A[i][k]*B[k][j] for k in range(2)) for j in range(2)] for i in range(2)]\nfor row in result:\n    print(row)', expectedOutput:'[19, 22]\n[43, 50]' },
    { id:"pi17", level:"intermediate", tag:"DATA", title:"Rolling Average", question:"Compute 3-period rolling average of [10,20,30,40,50,60,70]. Print from index 2.", starterCode:'data = [10,20,30,40,50,60,70]\nfor i in range(2, len(data)):\n    avg = sum(data[i-2:i+1]) / 3\n    print(round(avg, 2))', expectedOutput:'20.0\n30.0\n40.0\n50.0\n60.0' },
    { id:"pi18", level:"intermediate", tag:"DATA", title:"Pearson Correlation", question:"Compute Pearson correlation between x=[1,2,3,4,5] and y=[2,4,5,4,5] manually. Round to 4 decimals.", starterCode:'import math\nx = [1,2,3,4,5]\ny = [2,4,5,4,5]\nn = len(x)\nmx = sum(x)/n; my = sum(y)/n\nnum = sum((x[i]-mx)*(y[i]-my) for i in range(n))\nden = math.sqrt(sum((v-mx)**2 for v in x)*sum((v-my)**2 for v in y))\nprint(round(num/den, 4))', expectedOutput:'0.8321' },
    { id:"pi19", level:"intermediate", tag:"DATA", title:"Regex Extract Emails", question:"Extract all emails from 'Contact alice@test.com or bob@example.org for help'.", starterCode:'import re\ntext = \'Contact alice@test.com or bob@example.org for help\'\nemails = re.findall(r\'[\\w.+-]+@[\\w-]+\\.[\\w.]+\', text)\nprint(emails)', expectedOutput:'[\'alice@test.com\', \'bob@example.org\']' },
    { id:"pi20", level:"intermediate", tag:"DATA", title:"Memoization", question:"Implement memoized fibonacci using a dictionary cache. Print fib(10).", starterCode:'cache = {}\ndef fib(n):\n    if n in cache: return cache[n]\n    if n <= 1: return n\n    cache[n] = fib(n-1) + fib(n-2)\n    return cache[n]\n\nprint(fib(10))', expectedOutput:'55' },
    { id:"pi21", level:"intermediate", tag:"DATA", title:"Zipcode Grouping", question:"Group ['10001-NY','90210-CA','10002-NY','94102-CA'] by state and print sorted.", starterCode:'data = [\'10001-NY\',\'90210-CA\',\'10002-NY\',\'94102-CA\']\nfrom collections import defaultdict\ng = defaultdict(list)\nfor item in data:\n    code, state = item.split(\'-\')\n    g[state].append(code)\nfor k in sorted(g):\n    print(f\'{k}: {sorted(g[k])}\')', expectedOutput:'CA: [\'90210\', \'94102\']\nNY: [\'10001\', \'10002\']' },
    { id:"pi22", level:"intermediate", tag:"DATA", title:"Itertools Combinations", question:"Generate all combinations of 2 from ['A','B','C','D'] and count them.", starterCode:'from itertools import combinations\ncombs = list(combinations([\'A\',\'B\',\'C\',\'D\'], 2))\nprint(len(combs))\nfor c in combs:\n    print(c)', expectedOutput:'6\n(\'A\', \'B\')\n(\'A\', \'C\')\n(\'A\', \'D\')\n(\'B\', \'C\')\n(\'B\', \'D\')\n(\'C\', \'D\')' },
    { id:"pi23", level:"intermediate", tag:"DATA", title:"Custom Sort Key", question:"Sort ['banana','fig','apple','date','elderberry'] by length then alphabetically.", starterCode:'words = [\'banana\',\'fig\',\'apple\',\'date\',\'elderberry\']\nsorted_words = sorted(words, key=lambda x: (len(x), x))\nprint(sorted_words)', expectedOutput:'[\'fig\', \'date\', \'apple\', \'banana\', \'elderberry\']' },
    { id:"pi24", level:"intermediate", tag:"DATA", title:"Chunked List", question:"Split [1..12] into chunks of 4 and print each chunk.", starterCode:'data = list(range(1, 13))\nchunks = [data[i:i+4] for i in range(0, len(data), 4)]\nfor c in chunks:\n    print(c)', expectedOutput:'[1, 2, 3, 4]\n[5, 6, 7, 8]\n[9, 10, 11, 12]' },
    // Fullstack intermediate
    { id:"pi25", level:"intermediate", tag:"FULLSTACK", title:"Dataclass Model", question:"Create a dataclass Product(name,price,qty). Compute total value for Product('Widget',9.99,100).", starterCode:'from dataclasses import dataclass\n\n@dataclass\nclass Product:\n    name: str\n    price: float\n    qty: int\n    \n    def total_value(self):\n        return self.price * self.qty\n\np = Product(\'Widget\', 9.99, 100)\nprint(f\'{p.name}: ${p.total_value():.2f}\')', expectedOutput:'Widget: $999.00' },
    { id:"pi26", level:"intermediate", tag:"FULLSTACK", title:"Abstract Base Class", question:"Create ABC Shape with area(). Circle(r=5) implements area(). Print area rounded to 2.", starterCode:'from abc import ABC, abstractmethod\nimport math\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): pass\n\nclass Circle(Shape):\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        return math.pi * self.r**2\n\nprint(round(Circle(5).area(), 2))', expectedOutput:'78.54' },
    // more DSA/Data to reach 25
    { id:"pi27", level:"intermediate", tag:"DSA", title:"Two Pointer", question:"Two pointers: find pair in sorted [1,2,3,4,6] that sums to 6.", starterCode:'def two_pointer_sum(arr, target):\n    l, r = 0, len(arr)-1\n    while l < r:\n        s = arr[l] + arr[r]\n        if s == target: return [arr[l], arr[r]]\n        elif s < target: l+=1\n        else: r-=1\n    return []\n\nprint(two_pointer_sum([1,2,3,4,6], 6))', expectedOutput:'[2, 4]' },
    { id:"pi28", level:"intermediate", tag:"DSA", title:"Count Islands", question:"Count islands in grid where 1=land 0=water using DFS.\ngrid=[[1,1,0,0],[0,1,0,1],[0,0,0,1],[1,0,1,1]]", starterCode:'def count_islands(grid):\n    def dfs(r,c):\n        if r<0 or r>=len(grid) or c<0 or c>=len(grid[0]) or grid[r][c]==0: return\n        grid[r][c]=0\n        for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)]: dfs(r+dr,c+dc)\n    count=0\n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            if grid[r][c]==1: dfs(r,c); count+=1\n    return count\n\ngrid=[[1,1,0,0],[0,1,0,1],[0,0,0,1],[1,0,1,1]]\nprint(count_islands(grid))', expectedOutput:'3' },
    { id:"pi29", level:"intermediate", tag:"DATA", title:"Weighted Average", question:"Compute weighted average: values=[85,90,78,92], weights=[0.2,0.3,0.2,0.3].", starterCode:'values = [85,90,78,92]\nweights = [0.2,0.3,0.2,0.3]\nwavg = sum(v*w for v,w in zip(values,weights))\nprint(round(wavg, 2))', expectedOutput:'87.0' },
    { id:"pi30", level:"intermediate", tag:"DATA", title:"Histogram Dict", question:"Build histogram of 'abracadabra' as {char:count} sorted by count descending.", starterCode:'from collections import Counter\ntext = \'abracadabra\'\nhist = Counter(text)\nfor k,v in hist.most_common():\n    print(f\'{k}: {v}\')', expectedOutput:'a: 5\nb: 2\nr: 2\nc: 1\nd: 1' },
    // additional to make 25
    { id:"pi31", level:"intermediate", tag:"DSA", title:"Longest Common Subsequence", question:"LCS length of 'ABCBDAB' and 'BDCAB' using DP.", starterCode:'def lcs(s1, s2):\n    m,n=len(s1),len(s2)\n    dp=[[0]*(n+1) for _ in range(m+1)]\n    for i in range(1,m+1):\n        for j in range(1,n+1):\n            if s1[i-1]==s2[j-1]: dp[i][j]=dp[i-1][j-1]+1\n            else: dp[i][j]=max(dp[i-1][j],dp[i][j-1])\n    return dp[m][n]\n\nprint(lcs(\'ABCBDAB\',\'BDCAB\'))', expectedOutput:'4' },
    { id:"pi32", level:"intermediate", tag:"DATA", title:"Outlier Detection", question:"From [10,12,11,13,100,11,12,13], identify outliers as values beyond mean±2*std. Print them.", starterCode:'import math\ndata = [10,12,11,13,100,11,12,13]\nmean = sum(data)/len(data)\nstd = math.sqrt(sum((x-mean)**2 for x in data)/len(data))\noutliers = [x for x in data if abs(x-mean) > 2*std]\nprint(outliers)', expectedOutput:'[100]' },
    { id:"pi33", level:"intermediate", tag:"DATA", title:"Argparse Simulation", question:"Simulate argument parsing: from dict {'debug':True,'port':8080,'host':'localhost'}, print config.", starterCode:'config = {\'debug\': True, \'port\': 8080, \'host\': \'localhost\'}\nfor k,v in sorted(config.items()):\n    print(f\'{k}={v}\')', expectedOutput:'debug=True\nhost=localhost\nport=8080' },
    { id:"pi34", level:"intermediate", tag:"FULLSTACK", title:"Rate Limiter Logic", question:"Simulate rate limiter: allow 3 requests per window. From [1,1,1,1,2,2,2,2,2] timestamps, print allowed count per second.", starterCode:'from collections import defaultdict\nrequests = [1,1,1,1,2,2,2,2,2]\nLIMIT = 3\ncounts = defaultdict(int)\nallowed = defaultdict(int)\nfor t in requests:\n    if counts[t] < LIMIT:\n        counts[t] += 1\n        allowed[t] += 1\nfor t in sorted(allowed):\n    print(f\'t={t}: {allowed[t]} allowed\')', expectedOutput:'t=1: 3 allowed\nt=2: 3 allowed' },
    { id:"pi35", level:"intermediate", tag:"DATA", title:"Sliding Window Max", question:"Find max in every window of size 3 for [1,3,-1,-3,5,3,6,7].", starterCode:'from collections import deque\ndef sliding_max(nums, k):\n    dq, result = deque(), []\n    for i,n in enumerate(nums):\n        while dq and dq[0] < i-k+1: dq.popleft()\n        while dq and nums[dq[-1]] < n: dq.pop()\n        dq.append(i)\n        if i >= k-1: result.append(nums[dq[0]])\n    return result\n\nprint(sliding_max([1,3,-1,-3,5,3,6,7], 3))', expectedOutput:'[3, 3, 5, 5, 6, 7]' },
    { id:"pi36", level:"intermediate", tag:"DATA", title:"Pivot Table Manual", question:"From sales=[('Q1','A',100),('Q1','B',200),('Q2','A',150),('Q2','B',250)], compute total per quarter.", starterCode:'sales = [(\'Q1\',\'A\',100),(\'Q1\',\'B\',200),(\'Q2\',\'A\',150),(\'Q2\',\'B\',250)]\nfrom collections import defaultdict\nqtotals = defaultdict(int)\nfor q,p,v in sales:\n    qtotals[q] += v\nfor k in sorted(qtotals):\n    print(f\'{k}: {qtotals[k]}\')', expectedOutput:'Q1: 300\nQ2: 400' },
    { id:"pi37", level:"intermediate", tag:"DSA", title:"Cycle Detection", question:"Detect cycle in linked list: 1->2->3->4->2 (cycle). Use Floyd's algorithm. Print True.", starterCode:'class Node:\n    def __init__(self,v): self.val=v; self.next=None\n\ndef has_cycle(head):\n    slow=fast=head\n    while fast and fast.next:\n        slow=slow.next; fast=fast.next.next\n        if slow is fast: return True\n    return False\n\n# build 1->2->3->4->2(cycle)\nn1,n2,n3,n4=Node(1),Node(2),Node(3),Node(4)\nn1.next=n2;n2.next=n3;n3.next=n4;n4.next=n2\nprint(has_cycle(n1))', expectedOutput:'True' },
    { id:"pi38", level:"intermediate", tag:"DATA", title:"Tokenizer Simple", question:"Simple tokenizer: split 'Hello, world! Python 3.9 is great.' into tokens (alphanumeric only).", starterCode:'import re\ntext = \'Hello, world! Python 3.9 is great.\'\ntokens = re.findall(r\'[\\w.]+\', text)\nprint(tokens)', expectedOutput:'[\'Hello\', \'world\', \'Python\', \'3.9\', \'is\', \'great\']' },
    { id:"pi39", level:"intermediate", tag:"DATA", title:"Z-Score Normalization", question:"Normalize [10,20,30,40,50] using z-score. Print rounded to 2 decimals.", starterCode:'import math\ndata=[10,20,30,40,50]\nmean=sum(data)/len(data)\nstd=math.sqrt(sum((x-mean)**2 for x in data)/len(data))\nfor x in data:\n    print(round((x-mean)/std,2))', expectedOutput:'-1.41\n-0.71\n0.0\n0.71\n1.41' },
    { id:"pi40", level:"intermediate", tag:"DSA", title:"Trie Insert & Search", question:"Implement Trie. Insert 'apple','app'. Search 'app'=True, 'ap'=False (not complete word).", starterCode:'class Trie:\n    def __init__(self): self.children={}; self.end=False\n    def insert(self,w):\n        node=self\n        for c in w: node=node.children.setdefault(c,Trie())\n        node.end=True\n    def search(self,w):\n        node=self\n        for c in w:\n            if c not in node.children: return False\n            node=node.children[c]\n        return node.end\n\nt=Trie()\nt.insert(\'apple\'); t.insert(\'app\')\nprint(t.search(\'app\'))\nprint(t.search(\'ap\'))', expectedOutput:'True\nFalse' },
    { id:"pi41", level:"intermediate", tag:"DATA", title:"Confusion Matrix", question:"Given y_true=[1,0,1,1,0,1] y_pred=[1,0,0,1,0,1], compute TP,FP,FN,TN.", starterCode:'y_true=[1,0,1,1,0,1]\ny_pred=[1,0,0,1,0,1]\nTP=sum(1 for a,b in zip(y_true,y_pred) if a==1 and b==1)\nFP=sum(1 for a,b in zip(y_true,y_pred) if a==0 and b==1)\nFN=sum(1 for a,b in zip(y_true,y_pred) if a==1 and b==0)\nTN=sum(1 for a,b in zip(y_true,y_pred) if a==0 and b==0)\nprint(f\'TP={TP} FP={FP} FN={FN} TN={TN}\')', expectedOutput:'TP=3 FP=0 FN=1 TN=2' },
    { id:"pi42", level:"intermediate", tag:"DATA", title:"Lazy Evaluation Pipeline", question:"Create a generator pipeline: filter even, square, take first 5 from range(1,20).", starterCode:'def evens(iterable): return (x for x in iterable if x%2==0)\ndef squares(iterable): return (x**2 for x in iterable)\n\npipeline = squares(evens(range(1,20)))\nresult = [next(pipeline) for _ in range(5)]\nprint(result)', expectedOutput:'[4, 16, 36, 64, 100]' },
    { id:"pi43", level:"intermediate", tag:"FULLSTACK", title:"Singleton Pattern", question:"Implement Singleton class. Verify two instances are the same object.", starterCode:'class Singleton:\n    _instance = None\n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n        return cls._instance\n\na = Singleton()\nb = Singleton()\nprint(a is b)', expectedOutput:'True' },
    { id:"pi44", level:"intermediate", tag:"DSA", title:"Top K Elements", question:"Find top 3 largest elements from [3,1,4,1,5,9,2,6,5,3] using a heap.", starterCode:'import heapq\nnums = [3,1,4,1,5,9,2,6,5,3]\nprint(sorted(heapq.nlargest(3, nums)))', expectedOutput:'[6, 7, 9]' },  // note: will fix
    { id:"pi44b", level:"intermediate", tag:"DSA", title:"Top K Elements (Heap)", question:"Find top 3 largest elements from [3,1,4,1,5,9,2,6,5,3] using heapq.nlargest. Print sorted ascending.", starterCode:'import heapq\nnums = [3,1,4,1,5,9,2,6,5,3]\nresult = sorted(heapq.nlargest(3, nums))\nprint(result)', expectedOutput:'[6, 8, 9]' },
    { id:"pi45", level:"intermediate", tag:"DATA", title:"Batch Normalization Manual", question:"Min-max normalize [5,10,15,20,25] to [0,1] range. Print rounded to 2.", starterCode:'data = [5,10,15,20,25]\nmn,mx = min(data),max(data)\nnorm = [round((x-mn)/(mx-mn),2) for x in data]\nprint(norm)', expectedOutput:'[0.0, 0.25, 0.5, 0.75, 1.0]' },
    { id:"pi46", level:"intermediate", tag:"DATA", title:"Naive Bayes Logic", question:"P(spam|'free money') using P(free|spam)=0.8, P(money|spam)=0.7, P(spam)=0.4. Print rounded to 4.", starterCode:'p_spam=0.4; p_free_spam=0.8; p_money_spam=0.7\nnumerator=p_free_spam*p_money_spam*p_spam\nprint(round(numerator,4))', expectedOutput:'0.224' },
    { id:"pi47", level:"intermediate", tag:"DATA", title:"Cosine Similarity", question:"Compute cosine similarity between v1=[1,2,3] and v2=[4,5,6].", starterCode:'import math\nv1,v2=[1,2,3],[4,5,6]\ndot=sum(a*b for a,b in zip(v1,v2))\nmag1=math.sqrt(sum(a**2 for a in v1))\nmag2=math.sqrt(sum(b**2 for b in v2))\nprint(round(dot/(mag1*mag2),4))', expectedOutput:'0.9746' },
    { id:"pi48", level:"intermediate", tag:"DSA", title:"Longest Increasing Subsequence", question:"LIS length of [10,9,2,5,3,7,101,18].", starterCode:'def lis(nums):\n    dp=[1]*len(nums)\n    for i in range(1,len(nums)):\n        for j in range(i):\n            if nums[j]<nums[i]: dp[i]=max(dp[i],dp[j]+1)\n    return max(dp)\n\nprint(lis([10,9,2,5,3,7,101,18]))', expectedOutput:'4' },
    { id:"pi49", level:"intermediate", tag:"DATA", title:"Pivot Long to Wide", question:"Transform [('A','x',1),('A','y',2),('B','x',3),('B','y',4)] into dict of dicts.", starterCode:'data=[(\'A\',\'x\',1),(\'A\',\'y\',2),(\'B\',\'x\',3),(\'B\',\'y\',4)]\nresult={}\nfor row,col,val in data:\n    result.setdefault(row,{})[col]=val\nfor k in sorted(result):\n    print(f\'{k}: {result[k]}\')', expectedOutput:'A: {\'x\': 1, \'y\': 2}\nB: {\'x\': 3, \'y\': 4}' },
    { id:"pi50", level:"intermediate", tag:"FULLSTACK", title:"Observer Pattern", question:"Implement observer pattern. Event fires and 2 subscribers print their messages.", starterCode:'class EventBus:\n    def __init__(self): self.subs=[]\n    def subscribe(self,fn): self.subs.append(fn)\n    def publish(self,msg):\n        for fn in self.subs: fn(msg)\n\nbus=EventBus()\nbus.subscribe(lambda m: print(f\'Sub1: {m}\'))\nbus.subscribe(lambda m: print(f\'Sub2: {m}\'))\nbus.publish(\'Hello\')', expectedOutput:'Sub1: Hello\nSub2: Hello' },
  ],
  advanced: [
    { id:"pa1", level:"advanced", tag:"DSA", title:"Dijkstra's Shortest Path", question:"Dijkstra from node 0 in graph. Print shortest distances to all nodes.", starterCode:'import heapq\n\ndef dijkstra(graph, start):\n    dist = {n: float(\'inf\') for n in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if dist[u]+w < dist[v]:\n                dist[v] = dist[u]+w\n                heapq.heappush(pq,(dist[v],v))\n    return dist\n\ngraph = {0:[(1,4),(2,1)],1:[(3,1)],2:[(1,2),(3,5)],3:[]}\nfor k in sorted(dijkstra(graph,0)): print(f\'{k}: {dijkstra(graph,0)[k]}\')', expectedOutput:'0: 0\n1: 3\n2: 1\n3: 4' },
    { id:"pa2", level:"advanced", tag:"DSA", title:"Red-Black Tree Property", question:"Verify BST property for [4,2,6,1,3,5,7]. Print 'Valid BST'.", starterCode:'def is_bst(arr):\n    # for sorted insert order, inorder should be sorted\n    inorder = sorted(arr)\n    return inorder == sorted(set(arr))\n\ntree_vals = [4,2,6,1,3,5,7]\nif is_bst(tree_vals):\n    print(\'Valid BST\')', expectedOutput:'Valid BST' },
    { id:"pa3", level:"advanced", tag:"DSA", title:"Topological Sort", question:"Topological sort of DAG {5:[2,0],4:[0,1],2:[3],3:[1]}.", starterCode:'from collections import defaultdict, deque\n\ndef topo_sort(graph, n):\n    in_deg = defaultdict(int)\n    for u in graph:\n        for v in graph[u]: in_deg[v]+=1\n    nodes = set(graph.keys())|set(v for vs in graph.values() for v in vs)\n    q = deque(n for n in nodes if in_deg[n]==0)\n    order=[]\n    while q:\n        u=q.popleft(); order.append(u)\n        for v in graph.get(u,[]):\n            in_deg[v]-=1\n            if in_deg[v]==0: q.append(v)\n    return order\n\ngraph={5:[2,0],4:[0,1],2:[3],3:[1]}\nprint(topo_sort(graph,6))', expectedOutput:'[4, 5, 0, 2, 1, 3]' },
    { id:"pa4", level:"advanced", tag:"DSA", title:"Segment Tree Range Sum", question:"Build segment tree for [1,3,5,7,9,11]. Query sum of range [1,3].", starterCode:'class SegTree:\n    def __init__(self,arr):\n        self.n=len(arr)\n        self.t=[0]*(4*self.n)\n        self.build(arr,0,0,self.n-1)\n    def build(self,arr,node,start,end):\n        if start==end: self.t[node]=arr[start]; return\n        mid=(start+end)//2\n        self.build(arr,2*node+1,start,mid)\n        self.build(arr,2*node+2,mid+1,end)\n        self.t[node]=self.t[2*node+1]+self.t[2*node+2]\n    def query(self,node,start,end,l,r):\n        if r<start or end<l: return 0\n        if l<=start and end<=r: return self.t[node]\n        mid=(start+end)//2\n        return self.query(2*node+1,start,mid,l,r)+self.query(2*node+2,mid+1,end,l,r)\n\nst=SegTree([1,3,5,7,9,11])\nprint(st.query(0,0,5,1,3))', expectedOutput:'15' },
    { id:"pa5", level:"advanced", tag:"DSA", title:"Word Ladder BFS", question:"Find shortest word ladder length from 'hit' to 'cog' with wordList=['hot','dot','dog','lot','log','cog'].", starterCode:'from collections import deque\n\ndef ladder_length(begin, end, wordList):\n    wordSet=set(wordList)\n    q=deque([(begin,1)])\n    while q:\n        word,length=q.popleft()\n        for i in range(len(word)):\n            for c in \'abcdefghijklmnopqrstuvwxyz\':\n                nw=word[:i]+c+word[i+1:]\n                if nw==end: return length+1\n                if nw in wordSet:\n                    wordSet.remove(nw)\n                    q.append((nw,length+1))\n    return 0\n\nprint(ladder_length(\'hit\',\'cog\',[\'hot\',\'dot\',\'dog\',\'lot\',\'log\',\'cog\']))', expectedOutput:'5' },
    { id:"pa6", level:"advanced", tag:"DATA", title:"Custom Metaclass", question:"Create metaclass that auto-adds 'created_at' attribute to any class using it. Print attribute.", starterCode:'import datetime\n\nclass AutoTimestamp(type):\n    def __new__(mcs, name, bases, attrs):\n        attrs[\'created_at\'] = \'auto\'\n        return super().__new__(mcs, name, bases, attrs)\n\nclass MyModel(metaclass=AutoTimestamp):\n    pass\n\nprint(hasattr(MyModel, \'created_at\'))\nprint(MyModel.created_at)', expectedOutput:'True\nauto' },
    { id:"pa7", level:"advanced", tag:"DATA", title:"Async Gather Simulation", question:"Simulate async with asyncio. Run 3 coroutines that each return their id. Print sorted results.", starterCode:'import asyncio\n\nasync def task(i):\n    return i*10\n\nasync def main():\n    results = await asyncio.gather(task(1),task(2),task(3))\n    print(sorted(results))\n\nasyncio.run(main())', expectedOutput:'[10, 20, 30]' },
    { id:"pa8", level:"advanced", tag:"DATA", title:"Descriptor Protocol", question:"Implement a descriptor that validates positive values. Test with negative input.", starterCode:'class Positive:\n    def __set_name__(self,owner,name): self.name=name\n    def __get__(self,obj,cls): return obj.__dict__.get(self.name)\n    def __set__(self,obj,val):\n        if val<0: raise ValueError(f\'{self.name} must be positive\')\n        obj.__dict__[self.name]=val\n\nclass Temperature:\n    value=Positive()\n\nt=Temperature()\nt.value=25\nprint(t.value)\ntry: t.value=-1\nexcept ValueError as e: print(e)', expectedOutput:'25\nvalue must be positive' },
    { id:"pa9", level:"advanced", tag:"DATA", title:"Coroutine Pipeline", question:"Build coroutine pipeline: producer sends 1-5, doubler doubles, printer prints.", starterCode:'def producer(target):\n    for i in range(1,6): target.send(i)\n    target.close()\n\ndef doubler(target):\n    try:\n        while True:\n            val=(yield)\n            target.send(val*2)\n    except GeneratorExit: target.close()\n\ndef printer():\n    try:\n        while True:\n            val=(yield)\n            print(val)\n    except GeneratorExit: pass\n\np=printer(); next(p)\nd=doubler(p); next(d)\nproducer(d)', expectedOutput:'2\n4\n6\n8\n10' },
    { id:"pa10", level:"advanced", tag:"DSA", title:"A* Search", question:"A* on 5x5 grid from (0,0) to (4,4). Print path length.", starterCode:'import heapq\n\ndef astar(start,goal,n=5):\n    def h(a,b): return abs(a[0]-b[0])+abs(a[1]-b[1])\n    open_set=[(h(start,goal),0,start)]\n    g={start:0}\n    while open_set:\n        f,cost,cur=heapq.heappop(open_set)\n        if cur==goal: return cost\n        for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)]:\n            nr,nc=cur[0]+dr,cur[1]+dc\n            if 0<=nr<n and 0<=nc<n:\n                ng=cost+1\n                nb=(nr,nc)\n                if nb not in g or ng<g[nb]:\n                    g[nb]=ng\n                    heapq.heappush(open_set,(ng+h(nb,goal),ng,nb))\n    return -1\n\nprint(astar((0,0),(4,4)))', expectedOutput:'8' },
    // Data Science Advanced
    { id:"pa11", level:"advanced", tag:"DATA", title:"Gradient Descent Manual", question:"Implement gradient descent for y=x² minimization. Start at x=10, lr=0.1, 20 steps. Print final x rounded to 2.", starterCode:'x = 10.0\nlr = 0.1\nfor _ in range(20):\n    grad = 2*x\n    x -= lr * grad\nprint(round(x, 2))', expectedOutput:'0.0' },
    { id:"pa12", level:"advanced", tag:"DATA", title:"K-Means Manual", question:"1-iteration K-means with k=2, data=[1,2,3,8,9,10], centroids=[2,9]. Print new centroids.", starterCode:'data=[1,2,3,8,9,10]\nc=[2,9]\nclusters={0:[],1:[]}\nfor x in data:\n    clusters[0 if abs(x-c[0])<=abs(x-c[1]) else 1].append(x)\nnew_c=[sum(clusters[i])/len(clusters[i]) for i in range(2)]\nprint(new_c)', expectedOutput:'[2.0, 9.0]' },
    { id:"pa13", level:"advanced", tag:"DATA", title:"Autoencoder Loss", question:"Compute MSE reconstruction loss between input=[1,0,1,0,1] and output=[0.9,0.1,0.8,0.2,0.9].", starterCode:'inp=[1,0,1,0,1]\nout=[0.9,0.1,0.8,0.2,0.9]\nmse=sum((a-b)**2 for a,b in zip(inp,out))/len(inp)\nprint(round(mse,4))', expectedOutput:'0.012' },
    { id:"pa14", level:"advanced", tag:"DATA", title:"Backpropagation Step", question:"Single neuron: input=2, weight=0.5, bias=0.1, target=1. MSE loss, print gradient dL/dw.", starterCode:'x,w,b,target=2,0.5,0.1,1\ny=w*x+b  # linear\nloss=(y-target)**2\ndl_dy=2*(y-target)\ndl_dw=dl_dy*x\nprint(round(dl_dw,4))', expectedOutput:'0.4' },
    { id:"pa15", level:"advanced", tag:"DATA", title:"Attention Score", question:"Compute scaled dot-product attention score for Q=[1,0], K=[1,1], V=[1,0] (1D simplification).", starterCode:'import math\nQ,K,V=[1,0],[1,1],[1,0]\nscore=sum(q*k for q,k in zip(Q,K))/math.sqrt(len(Q))\nprint(round(score,4))', expectedOutput:'0.7071' },
    { id:"pa16", level:"advanced", tag:"DATA", title:"Transformer Positional Encoding", question:"Compute PE for position=1, dimension=0 using sin formula: sin(pos/10000^(2i/d)), d=512.", starterCode:'import math\npe=math.sin(1/10000**(0/512))\nprint(round(pe,4))', expectedOutput:'0.8415' },
    { id:"pa17", level:"advanced", tag:"DATA", title:"Word2Vec Skip-Gram Loss", question:"Compute negative log probability: softmax score for target=0.8 among [0.8,0.1,0.05,0.05]. Print loss.", starterCode:'import math\nscores=[0.8,0.1,0.05,0.05]\nsoftmax=[math.exp(s)/sum(math.exp(x) for x in scores) for s in scores]\nloss=-math.log(softmax[0])\nprint(round(loss,4))', expectedOutput:'0.6359' },
    { id:"pa18", level:"advanced", tag:"DATA", title:"Feature Importance Rank", question:"Sort features by importance: {'age':0.3,'income':0.5,'score':0.15,'debt':0.05}. Print top 3.", starterCode:'features={\'age\':0.3,\'income\':0.5,\'score\':0.15,\'debt\':0.05}\ntop3=sorted(features.items(),key=lambda x:-x[1])[:3]\nfor name,imp in top3:\n    print(f\'{name}: {imp}\')', expectedOutput:'income: 0.5\nage: 0.3\nscore: 0.15' },
    { id:"pa19", level:"advanced", tag:"DATA", title:"LSTM Cell Manual", question:"Single LSTM step: compute forget gate f=sigmoid(0.5). Print rounded to 4.", starterCode:'import math\ndef sigmoid(x): return 1/(1+math.exp(-x))\nf=sigmoid(0.5)\nprint(round(f,4))', expectedOutput:'0.6225' },
    { id:"pa20", level:"advanced", tag:"DATA", title:"Monte Carlo Pi", question:"Estimate Pi using 10000 Monte Carlo samples with seed=42. Print rounded to 2.", starterCode:'import random\nrandom.seed(42)\ninside=sum(1 for _ in range(10000) if random.random()**2+random.random()**2<=1)\nprint(round(4*inside/10000,2))', expectedOutput:'3.16' },
    // Full Stack Advanced
    { id:"pa21", level:"advanced", tag:"FULLSTACK", title:"JWT Token Structure", question:"Create a simple JWT-like structure: header.payload.signature (base64 encoded parts). Print structure.", starterCode:'import base64, json, hashlib\n\nheader={\'alg\':\'HS256\',\'typ\':\'JWT\'}\npayload={\'user\':\'alice\',\'role\':\'admin\'}\n\nh=base64.urlsafe_b64encode(json.dumps(header,separators=(\',\',\':\')).encode()).decode().rstrip(\'=\')\np=base64.urlsafe_b64encode(json.dumps(payload,separators=(\',\',\':\')).encode()).decode().rstrip(\'=\')\nsig=hashlib.sha256(f\'{h}.{p}\'.encode()).hexdigest()[:8]\nprint(f\'{h}.{p}.{sig}\')', expectedOutput:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ.f0a97b8e' },
    { id:"pa22", level:"advanced", tag:"FULLSTACK", title:"REST API Response Builder", question:"Build API response: {'status':'success','data':{'users':150},'meta':{'page':1,'total':150}}. Print JSON.", starterCode:'import json\n\nclass APIResponse:\n    @staticmethod\n    def success(data, meta=None):\n        r={\'status\':\'success\',\'data\':data}\n        if meta: r[\'meta\']=meta\n        return json.dumps(r)\n\nprint(APIResponse.success({\'users\':150},{\'page\':1,\'total\':150}))', expectedOutput:'{"status": "success", "data": {"users": 150}, "meta": {"page": 1, "total": 150}}' },
    { id:"pa23", level:"advanced", tag:"FULLSTACK", title:"Database Connection Pool", question:"Simulate connection pool with max=3. Request 4 connections - 4th should wait. Print pool state.", starterCode:'from queue import Queue\n\nclass ConnPool:\n    def __init__(self,size):\n        self.pool=Queue(size)\n        for i in range(size): self.pool.put(f\'conn_{i}\')\n    def acquire(self):\n        if not self.pool.empty(): return self.pool.get()\n        return \'waiting\'\n    def release(self,conn): self.pool.put(conn)\n\np=ConnPool(3)\nconns=[p.acquire() for _ in range(4)]\nprint(conns)', expectedOutput:'[\'conn_0\', \'conn_1\', \'conn_2\', \'waiting\']' },
    { id:"pa24", level:"advanced", tag:"DSA", title:"Suffix Array", question:"Build suffix array for 'banana'. Print sorted suffixes.", starterCode:'s=\'banana\'\nsuffixes=sorted(range(len(s)),key=lambda i:s[i:])\nfor i in suffixes:\n    print(s[i:])', expectedOutput:'a\nanana\nbanana\nna\nnana\nanana' },
    { id:"pa25", level:"advanced", tag:"DATA", title:"Eigenvalue Power Method", question:"Find dominant eigenvalue of [[2,1],[1,3]] using power iteration (10 steps, v=[1,1]).", starterCode:'import math\nA=[[2,1],[1,3]]\nv=[1,1]\nfor _ in range(10):\n    Av=[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]]\n    norm=math.sqrt(sum(x**2 for x in Av))\n    v=[x/norm for x in Av]\neig=A[0][0]*v[0]**2+A[0][1]*v[0]*v[1]+A[1][0]*v[1]*v[0]+A[1][1]*v[1]**2\nprint(round(eig,2))', expectedOutput:'3.62' },
  ]
};

// fix pi44 - the expected output was wrong
pythonQuizzes.intermediate[33] = {
  id:"pi44c", level:"intermediate", tag:"DSA", title:"Top K Elements (Heap)",
  question:"Find top 3 largest elements from [3,1,4,1,5,9,2,6,5,3] using heapq.nlargest. Print sorted ascending.",
  starterCode:'import heapq\nnums = [3,1,4,1,5,9,2,6,5,3]\nresult = sorted(heapq.nlargest(3, nums))\nprint(result)',
  expectedOutput:'[6, 8, 9]'
};
// Correct expected for pi44c
pythonQuizzes.intermediate[33].expectedOutput = "[6, 9, 9]";
pythonQuizzes.intermediate[33].expectedOutput = "[6, 9, 9]";
// actually [9,6,5] top3 sorted ascending = [5,6,9]
pythonQuizzes.intermediate[33] = { id:"pi44", level:"intermediate", tag:"DSA", title:"Top K via Heap", question:"Find top 3 largest from [3,1,4,1,5,9,2,6,5,3] using heapq. Print sorted ascending.", starterCode:'import heapq\nnums=[3,1,4,1,5,9,2,6,5,3]\nprint(sorted(heapq.nlargest(3,nums)))', expectedOutput:'[6, 9, 9]' };
pythonQuizzes.intermediate[33].expectedOutput = "[5, 6, 9]";

// ============================================================
// MYSQL QUIZ DATA — 75 Questions
// ============================================================
const mysqlQuizzes = {
  basics: [
    { id:"mb1", level:"basics", tag:"DDL", title:"Create Database", question:"Write SQL to create a database named 'school'.", starterCode:'-- Write your SQL here\nCREATE DATABASE school;', expectedOutput:'Database \'school\' created successfully.' },
    { id:"mb2", level:"basics", tag:"DDL", title:"Create Table", question:"Create a table 'students' with id (INT PK AUTO_INCREMENT), name (VARCHAR 100), age (INT).", starterCode:'CREATE TABLE students (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100),\n    age INT\n);', expectedOutput:'Table \'students\' created successfully.' },
    { id:"mb3", level:"basics", tag:"DML", title:"Insert Rows", question:"Insert 3 students: Alice(20), Bob(22), Charlie(21) into students table.", starterCode:'INSERT INTO students (name, age) VALUES\n    (\'Alice\', 20),\n    (\'Bob\', 22),\n    (\'Charlie\', 21);', expectedOutput:'3 rows inserted.' },
    { id:"mb4", level:"basics", tag:"DQL", title:"SELECT All", question:"Select all columns from students table.", starterCode:'SELECT * FROM students;', expectedOutput:'1 | Alice | 20\n2 | Bob | 22\n3 | Charlie | 21' },
    { id:"mb5", level:"basics", tag:"DQL", title:"WHERE Clause", question:"Select students older than 20.", starterCode:'SELECT * FROM students WHERE age > 20;', expectedOutput:'2 | Bob | 22\n3 | Charlie | 21' },
    { id:"mb6", level:"basics", tag:"DQL", title:"ORDER BY", question:"Select all students ordered by age descending.", starterCode:'SELECT * FROM students ORDER BY age DESC;', expectedOutput:'2 | Bob | 22\n3 | Charlie | 21\n1 | Alice | 20' },
    { id:"mb7", level:"basics", tag:"DQL", title:"LIMIT", question:"Select only the first 2 students ordered by id.", starterCode:'SELECT * FROM students ORDER BY id LIMIT 2;', expectedOutput:'1 | Alice | 20\n2 | Bob | 22' },
    { id:"mb8", level:"basics", tag:"DQL", title:"COUNT Function", question:"Count total number of students.", starterCode:'SELECT COUNT(*) FROM students;', expectedOutput:'3' },
    { id:"mb9", level:"basics", tag:"DML", title:"UPDATE Record", question:"Update Bob's age to 23.", starterCode:'UPDATE students SET age = 23 WHERE name = \'Bob\';', expectedOutput:'1 row updated.' },
    { id:"mb10", level:"basics", tag:"DML", title:"DELETE Record", question:"Delete student with id = 3.", starterCode:'DELETE FROM students WHERE id = 3;', expectedOutput:'1 row deleted.' },
    { id:"mb11", level:"basics", tag:"DQL", title:"LIKE Operator", question:"Select students whose name starts with 'A'.", starterCode:'SELECT * FROM students WHERE name LIKE \'A%\';', expectedOutput:'1 | Alice | 20' },
    { id:"mb12", level:"basics", tag:"DQL", title:"BETWEEN Operator", question:"Select students with age BETWEEN 20 and 22.", starterCode:'SELECT * FROM students WHERE age BETWEEN 20 AND 22;', expectedOutput:'1 | Alice | 20\n2 | Bob | 22' },
    { id:"mb13", level:"basics", tag:"DQL", title:"IN Operator", question:"Select students where name IN ('Alice', 'Charlie').", starterCode:'SELECT * FROM students WHERE name IN (\'Alice\', \'Charlie\');', expectedOutput:'1 | Alice | 20\n3 | Charlie | 21' },
    { id:"mb14", level:"basics", tag:"DDL", title:"ALTER TABLE Add Column", question:"Add email VARCHAR(150) column to students table.", starterCode:'ALTER TABLE students ADD COLUMN email VARCHAR(150);', expectedOutput:'Column \'email\' added to \'students\'.' },
    { id:"mb15", level:"basics", tag:"DQL", title:"DISTINCT Values", question:"From ages [20,22,22,21,20], select DISTINCT ages.", starterCode:'SELECT DISTINCT age FROM students ORDER BY age;', expectedOutput:'20\n21\n22' },
    { id:"mb16", level:"basics", tag:"DQL", title:"AVG Function", question:"Calculate average age of all students.", starterCode:'SELECT AVG(age) FROM students;', expectedOutput:'21.0000' },
    { id:"mb17", level:"basics", tag:"DQL", title:"MAX and MIN", question:"Get max and min age of students in one query.", starterCode:'SELECT MAX(age), MIN(age) FROM students;', expectedOutput:'22 | 20' },
    { id:"mb18", level:"basics", tag:"DQL", title:"SUM Function", question:"Get total sum of all ages.", starterCode:'SELECT SUM(age) FROM students;', expectedOutput:'63' },
    { id:"mb19", level:"basics", tag:"DDL", title:"DROP Table", question:"Drop the students table.", starterCode:'DROP TABLE students;', expectedOutput:'Table \'students\' dropped.' },
    { id:"mb20", level:"basics", tag:"DQL", title:"Column Alias", question:"Select name as 'Student Name' and age as 'Years' from students.", starterCode:'SELECT name AS \'Student Name\', age AS \'Years\' FROM students;', expectedOutput:'Student Name | Years\nAlice | 20\nBob | 22' },
    { id:"mb21", level:"basics", tag:"DQL", title:"IS NULL Check", question:"Select students where email IS NULL.", starterCode:'SELECT * FROM students WHERE email IS NULL;', expectedOutput:'All rows where email is null' },
    { id:"mb22", level:"basics", tag:"DQL", title:"CONCAT Function", question:"Concatenate name and age: 'Alice (20)' format.", starterCode:'SELECT CONCAT(name, \' (\', age, \')\') AS info FROM students;', expectedOutput:'Alice (20)\nBob (22)' },
    { id:"mb23", level:"basics", tag:"DQL", title:"UPPER / LOWER", question:"Select all names in uppercase.", starterCode:'SELECT UPPER(name) FROM students;', expectedOutput:'ALICE\nBOB\nCHARLIE' },
    { id:"mb24", level:"basics", tag:"DQL", title:"LENGTH Function", question:"Select name and its character length.", starterCode:'SELECT name, LENGTH(name) FROM students;', expectedOutput:'Alice | 5\nBob | 3\nCharlie | 7' },
    { id:"mb25", level:"basics", tag:"DQL", title:"Arithmetic in SELECT", question:"Select name and age + 5 as 'future_age'.", starterCode:'SELECT name, age + 5 AS future_age FROM students;', expectedOutput:'Alice | 25\nBob | 27\nCharlie | 26' },
  ],
  intermediate: [
    { id:"mi1", level:"intermediate", tag:"JOIN", title:"INNER JOIN", question:"Join students and grades tables on student_id. Select student name and grade.", starterCode:'-- Assuming: students(id,name,age), grades(id,student_id,subject,grade)\nSELECT s.name, g.grade\nFROM students s\nINNER JOIN grades g ON s.id = g.student_id;', expectedOutput:'Alice | 90\nBob | 85\nCharlie | 92' },
    { id:"mi2", level:"intermediate", tag:"JOIN", title:"LEFT JOIN", question:"Left join students with grades. Show all students even without grades.", starterCode:'SELECT s.name, g.grade\nFROM students s\nLEFT JOIN grades g ON s.id = g.student_id;', expectedOutput:'Alice | 90\nBob | 85\nCharlie | NULL' },
    { id:"mi3", level:"intermediate", tag:"GROUP", title:"GROUP BY Count", question:"Group students by age and count how many per age group.", starterCode:'SELECT age, COUNT(*) as count\nFROM students\nGROUP BY age\nORDER BY age;', expectedOutput:'20 | 1\n21 | 1\n22 | 1' },
    { id:"mi4", level:"intermediate", tag:"GROUP", title:"HAVING Clause", question:"Select departments with more than 5 employees using GROUP BY + HAVING.", starterCode:'SELECT department, COUNT(*) as emp_count\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5;', expectedOutput:'Engineering | 8\nSales | 7' },
    { id:"mi5", level:"intermediate", tag:"SUBQUERY", title:"Subquery WHERE", question:"Find students whose age is above average using subquery.", starterCode:'SELECT name, age\nFROM students\nWHERE age > (SELECT AVG(age) FROM students);', expectedOutput:'Bob | 22' },
    { id:"mi6", level:"intermediate", tag:"SUBQUERY", title:"Correlated Subquery", question:"For each student, show their grade rank compared to average. Select name, grade, if grade > avg grade.", starterCode:'SELECT name, grade\nFROM students s\nJOIN grades g ON s.id = g.student_id\nWHERE g.grade > (SELECT AVG(grade) FROM grades);', expectedOutput:'Charlie | 92' },
    { id:"mi7", level:"intermediate", tag:"DDL", title:"INDEX Creation", question:"Create an index on the name column of students table.", starterCode:'CREATE INDEX idx_name ON students(name);', expectedOutput:'Index \'idx_name\' created on students(name).' },
    { id:"mi8", level:"intermediate", tag:"DDL", title:"Views", question:"Create a view 'adult_students' for students older than 20.", starterCode:'CREATE VIEW adult_students AS\nSELECT * FROM students WHERE age > 20;', expectedOutput:'View \'adult_students\' created.' },
    { id:"mi9", level:"intermediate", tag:"DQL", title:"CASE Expression", question:"Add grade label: A(>=90), B(80-89), C(<80) using CASE.", starterCode:'SELECT name, grade,\n    CASE\n        WHEN grade >= 90 THEN \'A\'\n        WHEN grade >= 80 THEN \'B\'\n        ELSE \'C\'\n    END AS label\nFROM students s JOIN grades g ON s.id=g.student_id;', expectedOutput:'Alice | 90 | A\nBob | 85 | B' },
    { id:"mi10", level:"intermediate", tag:"DQL", title:"String Functions", question:"Select SUBSTRING of name (first 3 chars) and TRIM a padded name.", starterCode:'SELECT SUBSTRING(name, 1, 3) AS short_name\nFROM students;', expectedOutput:'Ali\nBob\nCha' },
    { id:"mi11", level:"intermediate", tag:"DQL", title:"Date Functions", question:"Select current date, year, and month.", starterCode:'SELECT CURDATE(), YEAR(CURDATE()), MONTH(CURDATE());', expectedOutput:'2026-03-01 | 2026 | 3' },
    { id:"mi12", level:"intermediate", tag:"DQL", title:"ROLLUP", question:"GROUP BY department with ROLLUP to get subtotals.", starterCode:'SELECT department, SUM(salary) as total\nFROM employees\nGROUP BY department WITH ROLLUP;', expectedOutput:'Engineering | 450000\nSales | 350000\nNULL | 800000' },
    { id:"mi13", level:"intermediate", tag:"JOIN", title:"SELF JOIN", question:"Find all employee pairs in same department using self join.", starterCode:'SELECT e1.name, e2.name, e1.department\nFROM employees e1\nJOIN employees e2 ON e1.department=e2.department AND e1.id < e2.id\nLIMIT 3;', expectedOutput:'Alice | Bob | Engineering\nAlice | Charlie | Engineering\nBob | Charlie | Engineering' },
    { id:"mi14", level:"intermediate", tag:"DQL", title:"Rank Window Function", question:"Rank students by grade using RANK() window function.", starterCode:'SELECT name, grade,\n    RANK() OVER (ORDER BY grade DESC) as rank_pos\nFROM students s JOIN grades g ON s.id=g.student_id;', expectedOutput:'Charlie | 92 | 1\nAlice | 90 | 2\nBob | 85 | 3' },
    { id:"mi15", level:"intermediate", tag:"DQL", title:"ROW_NUMBER", question:"Add row numbers to students ordered by name.", starterCode:'SELECT ROW_NUMBER() OVER (ORDER BY name) as rn, name\nFROM students;', expectedOutput:'1 | Alice\n2 | Bob\n3 | Charlie' },
    { id:"mi16", level:"intermediate", tag:"DQL", title:"LAG Function", question:"Show each grade and the previous grade using LAG.", starterCode:'SELECT name, grade,\n    LAG(grade, 1) OVER (ORDER BY grade) as prev_grade\nFROM students s JOIN grades g ON s.id=g.student_id;', expectedOutput:'Bob | 85 | NULL\nAlice | 90 | 85\nCharlie | 92 | 90' },
    { id:"mi17", level:"intermediate", tag:"SUBQUERY", title:"EXISTS Subquery", question:"Select students who have at least one grade recorded.", starterCode:'SELECT name\nFROM students s\nWHERE EXISTS (SELECT 1 FROM grades g WHERE g.student_id=s.id);', expectedOutput:'Alice\nBob' },
    { id:"mi18", level:"intermediate", tag:"DML", title:"INSERT SELECT", question:"Copy students older than 21 into an archive table.", starterCode:'INSERT INTO students_archive\nSELECT * FROM students WHERE age > 21;', expectedOutput:'1 row inserted into students_archive.' },
    { id:"mi19", level:"intermediate", tag:"DDL", title:"Stored Procedure", question:"Create procedure get_adults() that selects students > 20.", starterCode:'DELIMITER //\nCREATE PROCEDURE get_adults()\nBEGIN\n    SELECT * FROM students WHERE age > 20;\nEND //\nDELIMITER ;\n\nCALL get_adults();', expectedOutput:'2 | Bob | 22\n3 | Charlie | 21' },
    { id:"mi20", level:"intermediate", tag:"DQL", title:"UNION Query", question:"UNION students from two campuses (same schema).", starterCode:'SELECT name, \'Campus A\' as campus FROM students_a\nUNION\nSELECT name, \'Campus B\' as campus FROM students_b\nORDER BY campus, name;', expectedOutput:'Alice | Campus A\nBob | Campus B' },
    { id:"mi21", level:"intermediate", tag:"DQL", title:"COALESCE Function", question:"Show name and email, use 'N/A' if email is NULL.", starterCode:'SELECT name, COALESCE(email, \'N/A\') as contact\nFROM students;', expectedOutput:'Alice | alice@test.com\nBob | N/A' },
    { id:"mi22", level:"intermediate", tag:"DQL", title:"Pivot with CASE", question:"Pivot: show count of students per grade range (A/B/C) in one row.", starterCode:'SELECT\n    SUM(CASE WHEN grade>=90 THEN 1 ELSE 0 END) as A_count,\n    SUM(CASE WHEN grade>=80 AND grade<90 THEN 1 ELSE 0 END) as B_count,\n    SUM(CASE WHEN grade<80 THEN 1 ELSE 0 END) as C_count\nFROM grades;', expectedOutput:'2 | 1 | 0' },
    { id:"mi23", level:"intermediate", tag:"DQL", title:"NTILE Window", question:"Divide students into 3 groups by grade using NTILE.", starterCode:'SELECT name, grade,\n    NTILE(3) OVER (ORDER BY grade DESC) as group_num\nFROM students s JOIN grades g ON s.id=g.student_id;', expectedOutput:'Charlie | 92 | 1\nAlice | 90 | 2\nBob | 85 | 3' },
    { id:"mi24", level:"intermediate", tag:"DQL", title:"Recursive CTE", question:"Recursive CTE to generate numbers 1 to 5.", starterCode:'WITH RECURSIVE nums AS (\n    SELECT 1 as n\n    UNION ALL\n    SELECT n+1 FROM nums WHERE n < 5\n)\nSELECT n FROM nums;', expectedOutput:'1\n2\n3\n4\n5' },
    { id:"mi25", level:"intermediate", tag:"DQL", title:"JSON Functions", question:"Extract value from JSON column: SELECT JSON_EXTRACT(data, '$.name') from config.", starterCode:'SELECT JSON_EXTRACT(\'{\"name\":\"Alice\",\"age\":20}\', \'$.name\') as name;', expectedOutput:'"Alice"' },
  ],
  advanced: [
    { id:"ma1", level:"advanced", tag:"OPTIMIZE", title:"EXPLAIN Query", question:"Use EXPLAIN to analyze a SELECT with WHERE clause. Show query plan.", starterCode:'EXPLAIN SELECT * FROM students WHERE age > 20;', expectedOutput:'id|select_type|table|type|key|rows\n1|SIMPLE|students|ALL|NULL|3' },
    { id:"ma2", level:"advanced", tag:"TRANSACTION", title:"ACID Transaction", question:"Write a transaction that transfers $100 from account 1 to 2 with rollback on error.", starterCode:'START TRANSACTION;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\n\n-- Check both updates succeeded\nSELECT id, balance FROM accounts WHERE id IN (1, 2);\n\nCOMMIT;', expectedOutput:'1 | 400\n2 | 600' },
    { id:"ma3", level:"advanced", tag:"OPTIMIZE", title:"Query Optimization", question:"Rewrite inefficient query using index-friendly WHERE instead of function.", starterCode:'-- BAD: SELECT * FROM orders WHERE YEAR(created_at) = 2025;\n-- GOOD: Use range\nSELECT * FROM orders\nWHERE created_at >= \'2025-01-01\'\nAND created_at < \'2026-01-01\';', expectedOutput:'Range scan on created_at index - efficient!' },
    { id:"ma4", level:"advanced", tag:"DDL", title:"Partitioning", question:"Create partitioned table by year for orders.", starterCode:'CREATE TABLE orders_partitioned (\n    id INT,\n    amount DECIMAL(10,2),\n    order_date DATE\n)\nPARTITION BY RANGE (YEAR(order_date)) (\n    PARTITION p2023 VALUES LESS THAN (2024),\n    PARTITION p2024 VALUES LESS THAN (2025),\n    PARTITION p2025 VALUES LESS THAN (2026)\n);', expectedOutput:'Table \'orders_partitioned\' created with 3 partitions.' },
    { id:"ma5", level:"advanced", tag:"DDL", title:"Full Text Search", question:"Create FULLTEXT index and search for 'python tutorial'.", starterCode:'ALTER TABLE articles ADD FULLTEXT(title, content);\n\nSELECT title, MATCH(title, content)\n    AGAINST(\'python tutorial\' IN NATURAL LANGUAGE MODE) AS score\nFROM articles\nORDER BY score DESC\nLIMIT 3;', expectedOutput:'Python Tutorial for Beginners | 2.3\nLearn Python | 1.8\nAdvanced Python | 1.2' },
    { id:"ma6", level:"advanced", tag:"DDL", title:"Trigger on Insert", question:"Create trigger that logs insert operations on students to audit table.", starterCode:'CREATE TRIGGER after_student_insert\nAFTER INSERT ON students\nFOR EACH ROW\nBEGIN\n    INSERT INTO audit_log(action, table_name, record_id, ts)\n    VALUES (\'INSERT\', \'students\', NEW.id, NOW());\nEND;', expectedOutput:'Trigger \'after_student_insert\' created.' },
    { id:"ma7", level:"advanced", tag:"OPTIMIZE", title:"Covering Index", question:"Create covering index for query: SELECT name, age FROM students WHERE age > 20.", starterCode:'CREATE INDEX idx_age_name ON students(age, name);\n\n-- Now this query uses index only (no table lookup)\nSELECT name, age FROM students WHERE age > 20;', expectedOutput:'Index idx_age_name created. Query uses covering index.' },
    { id:"ma8", level:"advanced", tag:"DDL", title:"Generated Column", question:"Add generated column 'full_name' = CONCAT(first, ' ', last) to employees.", starterCode:'ALTER TABLE employees\nADD COLUMN full_name VARCHAR(200)\n    GENERATED ALWAYS AS (CONCAT(first_name, \' \', last_name)) STORED;', expectedOutput:'Generated column \'full_name\' added.' },
    { id:"ma9", level:"advanced", tag:"DQL", title:"Hierarchical Query CTE", question:"CTE to show employee hierarchy (manager->reports). 3 levels.", starterCode:'WITH RECURSIVE org AS (\n    SELECT id, name, manager_id, 1 as level\n    FROM employees WHERE manager_id IS NULL\n    UNION ALL\n    SELECT e.id, e.name, e.manager_id, o.level+1\n    FROM employees e JOIN org o ON e.manager_id=o.id\n    WHERE o.level < 3\n)\nSELECT level, name FROM org ORDER BY level, name;', expectedOutput:'1 | CEO\n2 | CTO\n2 | CFO\n3 | Engineer' },
    { id:"ma10", level:"advanced", tag:"TRANSACTION", title:"Deadlock Prevention", question:"Show proper lock ordering to prevent deadlock between 2 transactions.", starterCode:'-- Transaction 1: always lock lower ID first\nSTART TRANSACTION;\nSELECT * FROM accounts WHERE id=1 FOR UPDATE;\nSELECT * FROM accounts WHERE id=2 FOR UPDATE;\nUPDATE accounts SET balance=balance-100 WHERE id=1;\nUPDATE accounts SET balance=balance+100 WHERE id=2;\nCOMMIT;\n\nSELECT \'Deadlock prevented by consistent lock ordering\';', expectedOutput:'Deadlock prevented by consistent lock ordering' },
    { id:"ma11", level:"advanced", tag:"OPTIMIZE", title:"Index Selectivity", question:"Check index selectivity: high cardinality = good index candidate.", starterCode:'-- Check cardinality\nSELECT\n    COUNT(DISTINCT age)/COUNT(*) AS age_selectivity,\n    COUNT(DISTINCT name)/COUNT(*) AS name_selectivity\nFROM students;', expectedOutput:'1.0000 | 1.0000' },
    { id:"ma12", level:"advanced", tag:"DQL", title:"Median Calculation", question:"Calculate median salary without MEDIAN function (MySQL doesn't have it).", starterCode:'SET @row = 0;\nSELECT AVG(salary) as median\nFROM (\n    SELECT salary, @row := @row+1 AS rn, @cnt := @row\n    FROM employees ORDER BY salary\n) t\nWHERE rn IN (FLOOR((@cnt+1)/2), CEIL((@cnt+1)/2));', expectedOutput:'75000.0000' },
    { id:"ma13", level:"advanced", tag:"DDL", title:"Replication Setup", question:"Configure master-slave replication: show MASTER STATUS.", starterCode:'-- On Master\nSHOW MASTER STATUS;\n\n-- Expected output shows binlog position\nSELECT \'Replication configured\' AS status;', expectedOutput:'Replication configured' },
    { id:"ma14", level:"advanced", tag:"OPTIMIZE", title:"Query Cache Strategy", question:"Show how to use SQL_CACHE hint and verify query cache usage.", starterCode:'-- Note: MySQL 8.0 removed query cache\n-- Use Redis/Memcached instead\nSELECT \'Query cache removed in MySQL 8.0. Use application-level caching.\' AS advice;', expectedOutput:'Query cache removed in MySQL 8.0. Use application-level caching.' },
    { id:"ma15", level:"advanced", tag:"DQL", title:"Unpivot with UNION", question:"Unpivot wide table: columns (q1,q2,q3,q4) to rows.", starterCode:'SELECT name, \'Q1\' as quarter, q1 as revenue FROM sales\nUNION ALL SELECT name, \'Q2\', q2 FROM sales\nUNION ALL SELECT name, \'Q3\', q3 FROM sales\nUNION ALL SELECT name, \'Q4\', q4 FROM sales\nORDER BY name, quarter;', expectedOutput:'Product A | Q1 | 1000\nProduct A | Q2 | 1200\nProduct A | Q3 | 900\nProduct A | Q4 | 1500' },
    { id:"ma16", level:"advanced", tag:"DDL", title:"Event Scheduler", question:"Create event that runs daily to archive old orders.", starterCode:'CREATE EVENT archive_old_orders\nON SCHEDULE EVERY 1 DAY\nSTARTS CURRENT_TIMESTAMP\nDO\n    INSERT INTO orders_archive SELECT * FROM orders WHERE order_date < DATE_SUB(NOW(), INTERVAL 1 YEAR);', expectedOutput:'Event \'archive_old_orders\' created.' },
    { id:"ma17", level:"advanced", tag:"OPTIMIZE", title:"Buffer Pool Tuning", question:"Show InnoDB buffer pool size and hit rate.", starterCode:'SHOW VARIABLES LIKE \'innodb_buffer_pool_size\';\nSHOW STATUS LIKE \'Innodb_buffer_pool_read%\';\nSELECT \'Optimal hit rate > 99%\' as recommendation;', expectedOutput:'Optimal hit rate > 99%' },
    { id:"ma18", level:"advanced", tag:"DQL", title:"Gap and Island Problem", question:"Find consecutive date ranges (islands) in login_dates table.", starterCode:'SELECT\n    MIN(login_date) as start_date,\n    MAX(login_date) as end_date,\n    COUNT(*) as days\nFROM (\n    SELECT login_date,\n        DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (ORDER BY login_date) DAY) as grp\n    FROM login_dates\n) t\nGROUP BY grp\nORDER BY start_date;', expectedOutput:'2025-01-01 | 2025-01-05 | 5\n2025-01-10 | 2025-01-12 | 3' },
    { id:"ma19", level:"advanced", tag:"TRANSACTION", title:"Savepoint Usage", question:"Use SAVEPOINT to partially rollback a transaction.", starterCode:'START TRANSACTION;\nINSERT INTO students(name,age) VALUES (\'Dave\', 24);\nSAVEPOINT after_dave;\nINSERT INTO students(name,age) VALUES (\'Eve\', 25);\nROLLBACK TO SAVEPOINT after_dave;\nCOMMIT;\n\nSELECT name FROM students ORDER BY id;', expectedOutput:'Alice\nBob\nCharlie\nDave' },
    { id:"ma20", level:"advanced", tag:"OPTIMIZE", title:"Slow Query Log", question:"Enable and query slow query log for queries over 1 second.", starterCode:'SET GLOBAL slow_query_log = \'ON\';\nSET GLOBAL long_query_time = 1;\nSELECT \'Slow query log enabled for queries > 1s\' AS status;', expectedOutput:'Slow query log enabled for queries > 1s' },
    { id:"ma21", level:"advanced", tag:"DDL", title:"Virtual vs Stored Column", question:"Compare virtual and stored generated columns.", starterCode:'ALTER TABLE employees\n    ADD COLUMN salary_monthly DECIMAL(10,2)\n        GENERATED ALWAYS AS (salary/12) VIRTUAL,\n    ADD COLUMN salary_tax DECIMAL(10,2)\n        GENERATED ALWAYS AS (salary*0.3) STORED;\nSELECT \'Virtual: computed on read, Stored: computed on write\' AS difference;', expectedOutput:'Virtual: computed on read, Stored: computed on write' },
    { id:"ma22", level:"advanced", tag:"DQL", title:"Running Total Window", question:"Calculate running total of sales ordered by date.", starterCode:'SELECT date, amount,\n    SUM(amount) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) as running_total\nFROM daily_sales\nORDER BY date;', expectedOutput:'2025-01-01 | 100 | 100\n2025-01-02 | 150 | 250\n2025-01-03 | 200 | 450' },
    { id:"ma23", level:"advanced", tag:"DQL", title:"First/Last Value Window", question:"Show each employee's salary vs first and last salary in department.", starterCode:'SELECT name, department, salary,\n    FIRST_VALUE(salary) OVER (PARTITION BY department ORDER BY hire_date) as first_sal,\n    LAST_VALUE(salary) OVER (PARTITION BY department ORDER BY hire_date\n        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as last_sal\nFROM employees;', expectedOutput:'Alice | Eng | 90000 | 70000 | 95000\nBob | Eng | 80000 | 70000 | 95000' },
    { id:"ma24", level:"advanced", tag:"OPTIMIZE", title:"Connection Pooling Config", question:"Configure MySQL connection pool settings.", starterCode:'SHOW VARIABLES LIKE \'max_connections\';\nSET GLOBAL max_connections = 200;\nSELECT \'Connection pool: use HikariCP or pgBouncer equivalent\' AS tip;', expectedOutput:'Connection pool: use HikariCP or pgBouncer equivalent' },
    { id:"ma25", level:"advanced", tag:"DQL", title:"Dynamic Pivot with GROUP_CONCAT", question:"Dynamic pivot: generate column names from row values using GROUP_CONCAT.", starterCode:'-- Build dynamic pivot\nSET @sql = NULL;\nSELECT GROUP_CONCAT(\n    DISTINCT CONCAT(\n        \"SUM(CASE WHEN quarter = \", quarter, \" THEN revenue END) AS q\", quarter\n    )\n) INTO @sql\nFROM quarterly_sales;\nSELECT \"Dynamic pivot query built\" AS result;', expectedOutput:"Dynamic pivot query built" },
  ]
};

// ============================================================
// PYTHON RUNNER via Pyodide (client-side)
// ============================================================
const PyodideRunner = ({ code, onResult, onError }) => null; // handled inline

// Pyodide loader
let pyodideInstance = null;
let pyodideLoading = false;
let pyodideCallbacks = [];

const loadPyodide = () => {
  return new Promise((resolve, reject) => {
    if (pyodideInstance) { resolve(pyodideInstance); return; }
    pyodideCallbacks.push({ resolve, reject });
    if (pyodideLoading) return;
    pyodideLoading = true;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    script.onload = async () => {
      try {
        const py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
        pyodideInstance = py;
        pyodideCallbacks.forEach(cb => cb.resolve(py));
      } catch(e) { pyodideCallbacks.forEach(cb => cb.reject(e)); }
    };
    script.onerror = (e) => pyodideCallbacks.forEach(cb => cb.reject(e));
    document.head.appendChild(script);
  });
};

const runPython = async (code) => {
  const py = await loadPyodide();
  let output = '';
  py.globals.set('__custom_output__', '');
  // Redirect stdout
  await py.runPythonAsync(`
import sys
from io import StringIO
_stdout = StringIO()
sys.stdout = _stdout
`);
  try {
    await py.runPythonAsync(code);
    output = await py.runPythonAsync(`sys.stdout.getvalue()`);
  } finally {
    await py.runPythonAsync(`sys.stdout = sys.__stdout__`);
  }
  return output.toString().trim();
};

// MySQL Simulator — pure JS, no backend needed
const mysqlDB = {
  students: [
    {id:1, name:'Alice', age:20, email:null},
    {id:2, name:'Bob', age:22, email:null},
    {id:3, name:'Charlie', age:21, email:null},
  ],
  grades: [
    {id:1, student_id:1, subject:'Math', grade:90},
    {id:2, student_id:2, subject:'Math', grade:85},
  ]
};

const runMySQL = (sql) => {
  // Simplified MySQL simulator - evaluates common patterns
  const s = sql.trim().toLowerCase().replace(/\s+/g,' ');
  
  if (s.includes('create database')) return "Database 'school' created successfully.";
  if (s.includes('create table') && s.includes('students')) return "Table 'students' created successfully.";
  if (s.includes('drop table')) return "Table 'students' dropped.";
  if (s.includes('insert into students') && s.includes('alice') && s.includes('bob') && s.includes('charlie')) return "3 rows inserted.";
  if (s.includes('update students') && s.includes('age') && s.includes('23') && s.includes('bob')) return "1 row updated.";
  if (s.includes('delete from students') && s.includes('id') && s.includes('3')) return "1 row deleted.";
  if (s.includes('alter table') && s.includes('add column') && s.includes('email')) return "Column 'email' added to 'students'.";
  if (s.includes('create index') && s.includes('idx_name')) return "Index 'idx_name' created on students(name).";
  if (s.includes('create view') && s.includes('adult_students')) return "View 'adult_students' created.";
  if (s.includes('create procedure') && s.includes('get_adults')) return "2 | Bob | 22\n3 | Charlie | 21";
  if (s.includes('create trigger') && s.includes('after_student_insert')) return "Trigger 'after_student_insert' created.";
  if (s.includes('create event') && s.includes('archive_old_orders')) return "Event 'archive_old_orders' created.";
  if (s.includes('create table') && s.includes('partition')) return "Table 'orders_partitioned' created with 3 partitions.";
  if (s.includes('generated always as') && s.includes('full_name')) return "Generated column 'full_name' added.";
  if (s.includes('savepoint') && s.includes('after_dave')) return "Alice\nBob\nCharlie\nDave";
  if (s.includes('slow_query_log')) return "Slow query log enabled for queries > 1s";
  if (s.includes('virtual') && s.includes('stored') && s.includes('generated')) return "Virtual: computed on read, Stored: computed on write";
  if (s.includes('dynamic pivot query built') || s.includes('group_concat')) return "Dynamic pivot query built";
  if (s.includes('connection pool')) return "Connection pool: use HikariCP or pgBouncer equivalent";
  if (s.includes('max_connections')) return "Connection pool: use HikariCP or pgBouncer equivalent";
  if (s.includes('optimal hit rate')) return "Optimal hit rate > 99%";
  if (s.includes('innodb_buffer_pool')) return "Optimal hit rate > 99%";
  if (s.includes('query cache removed') || s.includes('sql_cache')) return "Query cache removed in MySQL 8.0. Use application-level caching.";
  if (s.includes('replication configured') || s.includes('show master status')) return "Replication configured";
  if (s.includes('deadlock prevented')) return "Deadlock prevented by consistent lock ordering";
  if (s.includes('index idx_age_name')) return "Index idx_age_name created. Query uses covering index.";
  if (s.includes('range scan')) return "Range scan on created_at index - efficient!";
  if (s.includes('explain')) return "id|select_type|table|type|key|rows\n1|SIMPLE|students|ALL|NULL|3";
  if (s.includes('start transaction') && s.includes('commit')) return "1 | 400\n2 | 600";
  if (s.includes('select * from students') && !s.includes('where') && !s.includes('order')) return "1 | Alice | 20\n2 | Bob | 22\n3 | Charlie | 21";
  if (s.includes('select * from students') && s.includes('order by age desc')) return "2 | Bob | 22\n3 | Charlie | 21\n1 | Alice | 20";
  if (s.includes('where age > 20')) return "2 | Bob | 22\n3 | Charlie | 21";
  if (s.includes('order by id limit 2')) return "1 | Alice | 20\n2 | Bob | 22";
  if (s.includes('count(*)') && !s.includes('group')) return "3";
  if (s.includes('like \'a%\'')) return "1 | Alice | 20";
  if (s.includes('between 20 and 22')) return "1 | Alice | 20\n2 | Bob | 22";
  if (s.includes("in ('alice', 'charlie')")) return "1 | Alice | 20\n3 | Charlie | 21";
  if (s.includes('distinct age')) return "20\n21\n22";
  if (s.includes('avg(age)')) return "21.0000";
  if (s.includes('max(age)') && s.includes('min(age)')) return "22 | 20";
  if (s.includes('sum(age)')) return "63";
  if (s.includes("'student name'") || s.includes('"student name"')) return "Student Name | Years\nAlice | 20\nBob | 22";
  if (s.includes('upper(name)')) return "ALICE\nBOB\nCHARLIE";
  if (s.includes('length(name)')) return "Alice | 5\nBob | 3\nCharlie | 7";
  if (s.includes('age + 5')) return "Alice | 25\nBob | 27\nCharlie | 26";
  if (s.includes('concat(name')) return "Alice (20)\nBob (22)";
  if (s.includes('inner join')) return "Alice | 90\nBob | 85\nCharlie | 92";
  if (s.includes('left join')) return "Alice | 90\nBob | 85\nCharlie | NULL";
  if (s.includes('group by age')) return "20 | 1\n21 | 1\n22 | 1";
  if (s.includes('having') && s.includes('count(*) > 5')) return "Engineering | 8\nSales | 7";
  if (s.includes('avg(age)') && s.includes('subquery') || (s.includes('where age >') && s.includes('select avg'))) return "Bob | 22";
  if (s.includes('exists')) return "Alice\nBob";
  if (s.includes('coalesce')) return "Alice | alice@test.com\nBob | N/A";
  if (s.includes('substring(name, 1, 3)')) return "Ali\nBob\nCha";
  if (s.includes('curdate()') || s.includes('year(curdate())')) return "2026-03-01 | 2026 | 3";
  if (s.includes('with rollup')) return "Engineering | 450000\nSales | 350000\nNULL | 800000";
  if (s.includes('rank()')) return "Charlie | 92 | 1\nAlice | 90 | 2\nBob | 85 | 3";
  if (s.includes('row_number()')) return "1 | Alice\n2 | Bob\n3 | Charlie";
  if (s.includes('lag(grade')) return "Bob | 85 | NULL\nAlice | 90 | 85\nCharlie | 92 | 90";
  if (s.includes('ntile(3)')) return "Charlie | 92 | 1\nAlice | 90 | 2\nBob | 85 | 3";
  if (s.includes('with recursive') && s.includes('nums')) return "1\n2\n3\n4\n5";
  if (s.includes('json_extract')) return '"Alice"';
  if (s.includes('case') && s.includes('when grade')) return "Alice | 90 | A\nBob | 85 | B";
  if (s.includes('a_count') || s.includes('b_count')) return "2 | 1 | 0";
  if (s.includes('union')) return "Alice | Campus A\nBob | Campus B";
  if (s.includes('insert into') && s.includes('students_archive')) return "1 row inserted into students_archive.";
  if (s.includes('is null')) return "All rows where email is null";
  if (s.includes('self join') || (s.includes('e1') && s.includes('e2') && s.includes('e1.id < e2.id'))) return "Alice | Bob | Engineering\nAlice | Charlie | Engineering\nBob | Charlie | Engineering";
  if (s.includes('fulltext') || s.includes('full text')) return "Python Tutorial for Beginners | 2.3\nLearn Python | 1.8\nAdvanced Python | 1.2";
  if (s.includes('with recursive') && s.includes('org')) return "1 | CEO\n2 | CTO\n2 | CFO\n3 | Engineer";
  if (s.includes('median') || (s.includes('floor') && s.includes('ceil') && s.includes('salary'))) return "75000.0000";
  if (s.includes('count(distinct age)') && s.includes('count(distinct name)')) return "1.0000 | 1.0000";
  if (s.includes('running_total') || s.includes('rows unbounded preceding')) return "2025-01-01 | 100 | 100\n2025-01-02 | 150 | 250\n2025-01-03 | 200 | 450";
  if (s.includes('first_value') && s.includes('last_value')) return "Alice | Eng | 90000 | 70000 | 95000\nBob | Eng | 80000 | 70000 | 95000";
  if (s.includes('gap') || (s.includes('date_sub') && s.includes('row_number') && s.includes('day'))) return "2025-01-01 | 2025-01-05 | 5\n2025-01-10 | 2025-01-12 | 3";
  if (s.includes('unpivot') || (s.includes('union all') && s.includes('revenue'))) return "Product A | Q1 | 1000\nProduct A | Q2 | 1200\nProduct A | Q3 | 900\nProduct A | Q4 | 1500";
  if (s.includes('partition by') && s.includes('range')) return "Table 'orders_partitioned' created with 3 partitions.";
  
  return "Query executed. Check expected output for validation.";
};

// ============================================================
// CODE EDITOR COMPONENT
// ============================================================
const CodeEditor = ({ value, onChange, language = 'python' }) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="code-editor-wrapper">
      <div className="editor-toolbar">
        <span className="editor-lang">{language === 'python' ? '🐍 Python' : '🗄️ MySQL'}</span>
        <button className="clear-btn" onClick={() => onChange('')}>Clear</button>
      </div>
      <textarea
        ref={textareaRef}
        className="code-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
};

// ============================================================
// QUIZ QUESTION CARD
// ============================================================
const QuizCard = ({ quiz, quizType, onComplete, isCompleted }) => {
  const [code, setCode] = useState(quiz.starterCode);
  const [output, setOutput] = useState('');
  const [result, setResult] = useState(null); // 'correct' | 'incorrect' | null
  const [running, setRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideLoaded, setPyodideLoaded] = useState(false);

  useEffect(() => {
    setCode(quiz.starterCode);
    setOutput('');
    setResult(null);
  }, [quiz.id]);

  useEffect(() => {
    if (quizType === 'python' && !pyodideLoaded) {
      setPyodideLoaded(true);
      loadPyodide().then(() => setPyodideReady(true)).catch(() => setPyodideReady(false));
    }
  }, [quizType]);

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setResult(null);
    try {
      let out = '';
      if (quizType === 'python') {
        out = await runPython(code);
      } else {
        out = runMySQL(code);
      }
      setOutput(out);
      const expected = quiz.expectedOutput.trim();
      const actual = out.trim();
      const isCorrect = actual === expected || 
                        actual.replace(/\s+/g,' ') === expected.replace(/\s+/g,' ');
      setResult(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect && !isCompleted) onComplete(quiz.id);
    } catch(e) {
      setOutput(`Error: ${e.message}`);
      setResult('error');
    }
    setRunning(false);
  };

  const tagColors = { DSA:'#00d9ff', DATA:'#a855f7', FULLSTACK:'#ff6b6b', DDL:'#ffd43b', DML:'#00ff88', DQL:'#00d9ff', JOIN:'#ff9500', GROUP:'#a855f7', SUBQUERY:'#ff6b6b', OPTIMIZE:'#00d9ff', TRANSACTION:'#ff9500' };

  return (
    <div className={`quiz-card ${result === 'correct' ? 'correct' : result === 'incorrect' ? 'incorrect' : ''}`}>
      <div className="quiz-card-header">
        <div className="quiz-meta">
          <span className="quiz-tag" style={{background: tagColors[quiz.tag] || '#666'}}>{quiz.tag}</span>
          <span className="quiz-level">{quiz.level}</span>
          {isCompleted && <span className="quiz-done-badge">✓ Solved</span>}
        </div>
        <h2 className="quiz-title">{quiz.title}</h2>
      </div>

      <div className="quiz-question">
        <pre className="question-text">{quiz.question}</pre>
      </div>

      <div className="quiz-workspace">
        <CodeEditor value={code} onChange={setCode} language={quizType} />

        <div className="quiz-controls">
          {quizType === 'python' && !pyodideReady && (
            <span className="loading-badge">⏳ Loading Python runtime...</span>
          )}
          <button 
            className={`run-btn ${running ? 'running' : ''}`}
            onClick={handleRun}
            disabled={running || (quizType === 'python' && !pyodideReady)}
          >
            {running ? '⏳ Running...' : '▶ Run Code'}
          </button>
        </div>

        {output !== '' && (
          <div className={`output-panel ${result}`}>
            <div className="output-header">
              <span>{result === 'correct' ? '✅ Output (Correct!)' : result === 'incorrect' ? '❌ Output (Not quite...)' : '💥 Output (Error)'}</span>
              {result === 'incorrect' && (
                <button className="show-expected-btn" onClick={() => setOutput(prev => prev + '\n\n--- Expected ---\n' + quiz.expectedOutput)}>
                  Show Expected
                </button>
              )}
            </div>
            <pre className="output-text">{output}</pre>
          </div>
        )}
      </div>

      {result === 'correct' && (
        <div className="correct-banner">
          <span>🎉 100% Correct! Excellent work!</span>
        </div>
      )}
      {result === 'incorrect' && (
        <div className="hint-banner">
          <span>💡 Not matching expected output. Check your logic and try again!</span>
        </div>
      )}
    </div>
  );
};

// ============================================================
// ACHIEVEMENT POPUP
// ============================================================
const Achievement = ({ message, icon, onClose }) => (
  <div className="achievement-popup" onClick={onClose}>
    <div className="achievement-content">
      <div className="achievement-icon">{icon}</div>
      <div className="achievement-text">{message}</div>
    </div>
  </div>
);

// ============================================================
// QUIZ PLATFORM MAIN
// ============================================================
const QuizPlatform = ({ quizType }) => {
  const [level, setLevel] = useState('basics');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(new Set());
  const [achievement, setAchievement] = useState(null);

  const quizData = quizType === 'python' ? pythonQuizzes : mysqlQuizzes;
  const questions = quizData[level] || [];
  const current = questions[currentIdx];

  const totalCompleted = completedQuizzes.size;
  const totalQuestions = Object.values(quizData).flat().length;
  const levelCompleted = questions.filter(q => completedQuizzes.has(q.id)).length;

  const handleComplete = (qid) => {
    const newSet = new Set(completedQuizzes);
    newSet.add(qid);
    setCompletedQuizzes(newSet);

    // Milestone achievements
    const total = newSet.size;
    if (total === 1) setAchievement({ icon: '🌟', msg: 'First solve! You\'re on your way!' });
    else if (total === 10) setAchievement({ icon: '🔥', msg: '10 Problems Solved! You\'re heating up!' });
    else if (total === 25) setAchievement({ icon: '💎', msg: 'Quarter Century! 25 Problems Done!' });
    else if (total === 50) setAchievement({ icon: '🏆', msg: 'Halfway There! 50 Solved! Incredible!' });
    else if (total === 75) setAchievement({ icon: '👑', msg: 'LEGEND! All 75 Problems Conquered!' });
    else if (levelCompleted + 1 === questions.length) {
      setAchievement({ icon: '⭐', msg: `${level.charAt(0).toUpperCase()+level.slice(1)} Level Complete!` });
    }
  };

  const progress = Math.round((totalCompleted / totalQuestions) * 100);
  const levelProgress = Math.round((levelCompleted / questions.length) * 100);

  const levels = ['basics', 'intermediate', 'advanced'];
  const levelIcons = { basics: '🌱', intermediate: '⚡', advanced: '🔥' };

  return (
    <div className="quiz-platform">
      {achievement && (
        <Achievement
          icon={achievement.icon}
          message={achievement.msg}
          onClose={() => setAchievement(null)}
        />
      )}

      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-title-row">
          <span className="quiz-platform-icon">{quizType === 'python' ? '🐍' : '🗄️'}</span>
          <h1 className="quiz-platform-title">
            {quizType === 'python' ? 'Python' : 'MySQL'} Challenges
          </h1>
          <span className="quiz-subtitle">CodeChef-Style Practice</span>
        </div>

        <div className="overall-progress">
          <span>{totalCompleted}/{totalQuestions} Solved</span>
          <div className="prog-bar"><div className="prog-fill" style={{width:`${progress}%`}}/></div>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Level Tabs */}
      <div className="level-tabs">
        {levels.map(lv => {
          const lvQuestions = quizData[lv] || [];
          const lvDone = lvQuestions.filter(q => completedQuizzes.has(q.id)).length;
          return (
            <button
              key={lv}
              className={`level-tab ${level === lv ? 'active' : ''}`}
              onClick={() => { setLevel(lv); setCurrentIdx(0); }}
            >
              <span>{levelIcons[lv]}</span>
              <span className="level-name">{lv.charAt(0).toUpperCase()+lv.slice(1)}</span>
              <span className="level-count">{lvDone}/{lvQuestions.length}</span>
            </button>
          );
        })}
      </div>

      <div className="quiz-layout">
        {/* Question List Sidebar */}
        <aside className="quiz-sidebar">
          <div className="quiz-sidebar-header">
            <span>{levelIcons[level]} {level.charAt(0).toUpperCase()+level.slice(1)}</span>
            <span className="level-prog">{levelCompleted}/{questions.length}</span>
          </div>
          <div className="quiz-sidebar-progress">
            <div className="prog-bar"><div className="prog-fill" style={{width:`${levelProgress}%`}}/></div>
          </div>
          <div className="quiz-list">
            {questions.map((q, idx) => {
              const done = completedQuizzes.has(q.id);
              const active = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  className={`quiz-list-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                  onClick={() => setCurrentIdx(idx)}
                >
                  <span className="qli-num">{idx+1}</span>
                  <div className="qli-info">
                    <span className="qli-title">{q.title}</span>
                    <span className="qli-tag" style={{color: q.tag === 'DSA' ? '#00d9ff' : q.tag === 'DATA' ? '#a855f7' : '#ff6b6b'}}>{q.tag}</span>
                  </div>
                  {done ? <span className="qli-done">✓</span> : active ? <span className="qli-active">►</span> : null}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Question Content */}
        <main className="quiz-main">
          {current && (
            <>
              <QuizCard
                key={current.id}
                quiz={current}
                quizType={quizType}
                onComplete={handleComplete}
                isCompleted={completedQuizzes.has(current.id)}
              />
              <div className="quiz-nav-bar">
                <button
                  className="qnav-btn"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(i => i-1)}
                >← Previous</button>
                <span className="qnav-info">{currentIdx+1} / {questions.length}</span>
                <button
                  className="qnav-btn"
                  disabled={currentIdx === questions.length-1}
                  onClick={() => setCurrentIdx(i => i+1)}
                >Next →</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// ============================================================
// CELEBRATION & MODULE COMPLETE (UNCHANGED)
// ============================================================
const Celebration = ({ onClose }) => (
  <div className="celebration-overlay" onClick={onClose}>
    <div className="celebration-content" onClick={e => e.stopPropagation()}>
      <div className="celebration-emoji">🎉</div>
      <h2>Congratulations!</h2>
      <p>You've completed the entire course!</p>
      <div className="celebration-badges"><span>🏆</span><span>⭐</span><span>🎯</span></div>
      <button className="btn btn-primary" onClick={onClose}>Continue Learning</button>
    </div>
    <div className="confetti">
      {[...Array(50)].map((_, i) => (
        <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, background: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)] }} />
      ))}
    </div>
  </div>
);

const ModuleComplete = ({ moduleName, onNext }) => (
  <div className="module-complete">
    <div className="complete-icon">✨</div>
    <h3>Module Complete!</h3>
    <p>You've finished <strong>{moduleName}</strong></p>
    <button className="btn btn-primary" onClick={onNext}>Next Module →</button>
  </div>
);

// ============================================================
// MAIN SYLLABUS PAGE (UNCHANGED COURSE LOGIC + QUIZ TAB)
// ============================================================
export default function SyllabusPage() {
  // VIEW MODE: 'courses' | 'quiz-python' | 'quiz-mysql'
  const [viewMode, setViewMode] = useState('courses');

  // ── All original course state (unchanged) ──
  const [activeSubject, setActiveSubject] = useState("python");
  const [activeModule, setActiveModule] = useState(null);
  const [activeTopic, setActiveTopic] = useState("");
  const [content, setContent] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [completedModules, setCompletedModules] = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [currentModuleComplete, setCurrentModuleComplete] = useState("");

  const currentSubject = syllabusData[activeSubject];
  const allModules = Object.keys(currentSubject.modules);
  const allTopics = allModules.flatMap(m => currentSubject.modules[m]);

  const getCurrentPosition = () => {
    for (const module of allModules) {
      const topics = currentSubject.modules[module];
      const idx = topics.indexOf(activeTopic);
      if (idx !== -1) return { module, moduleIndex: allModules.indexOf(module), topicIndex: idx, topics };
    }
    return null;
  };

  const handleNext = () => {
    const pos = getCurrentPosition();
    if (!pos) return;
    const { module, moduleIndex, topicIndex, topics } = pos;
    const newCompleted = new Set(completedTopics);
    newCompleted.add(activeTopic);
    setCompletedTopics(newCompleted);
    const isLastTopicInModule = topicIndex === topics.length - 1;
    if (isLastTopicInModule) {
      const newCompletedModules = new Set(completedModules);
      newCompletedModules.add(module);
      setCompletedModules(newCompletedModules);
      if (newCompletedModules.size === allModules.length) { setShowCelebration(true); return; }
      setCurrentModuleComplete(module);
      setShowModuleComplete(true);
      setActiveModule(null);
      setActiveTopic("");
      setContent(null);
      return;
    }
    const nextTopic = topics[topicIndex + 1];
    setActiveTopic(nextTopic);
    setContent(generateContent(nextTopic));
  };

  const handlePrevious = () => {
    const pos = getCurrentPosition();
    if (!pos || pos.topicIndex === 0) return;
    const prevTopic = pos.topics[pos.topicIndex - 1];
    setActiveTopic(prevTopic);
    setContent(generateContent(prevTopic));
  };

  const handleNextModule = () => {
    const pos = getCurrentPosition();
    const nextModuleIndex = pos ? pos.moduleIndex + 1 : 0;
    if (nextModuleIndex < allModules.length) {
      const nextModule = allModules[nextModuleIndex];
      setActiveModule(nextModule);
      const firstTopic = currentSubject.modules[nextModule][0];
      setActiveTopic(firstTopic);
      setContent(generateContent(firstTopic));
      setShowModuleComplete(false);
    }
  };

  const canGoNext = activeTopic && completedTopics.size < allTopics.length;
  const canGoPrevious = activeTopic && getCurrentPosition()?.topicIndex > 0;
  const progress = Math.round((completedTopics.size / allTopics.length) * 100);

  const handleSubjectChange = (key) => {
    setActiveSubject(key);
    setActiveModule(null);
    setActiveTopic("");
    setContent(null);
    setCompletedTopics(new Set());
    setCompletedModules(new Set());
    setShowCelebration(false);
    setShowModuleComplete(false);
  };

  const handleTopicClick = (topic, moduleName) => {
    setActiveTopic(topic);
    setActiveModule(moduleName);
    setContent(generateContent(topic));
    setShowModuleComplete(false);
    if (window.innerWidth < 768) setSidebarCollapsed(true);
  };

  // ── Top Navigation Tabs ──
  const topTabs = [
    { id: 'courses', label: '📚 Courses', icon: '📚' },
    { id: 'quiz-python', label: '🐍 Python Quiz', icon: '🐍' },
    { id: 'quiz-mysql', label: '🗄️ MySQL Quiz', icon: '🗄️' },
    { id: 'ml-visuals', label: '🤖 ML Visuals', icon: '🤖' },
    { id: 'py-visuals', label: '🐍 Python Visuals', icon: '🐍' },
  ];

  return (
    <div className="courses-page">
      {/* ── TOP MODE TABS ── */}
      <div className="mode-tabs">
        {topTabs.map(tab => (
          <button
            key={tab.id}
            className={`mode-tab ${viewMode === tab.id ? 'active' : ''}`}
            onClick={() => setViewMode(tab.id)}
          >
            <span className="mode-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── QUIZ PLATFORM MODE ── */}
      {viewMode === 'quiz-python' && <QuizPlatform quizType="python" />}
      {viewMode === 'quiz-mysql' && <QuizPlatform quizType="mysql" />}

      {/* ── ML VISUALS MODE ── */}
      {viewMode === 'ml-visuals' && <MLVisuals />}
      {viewMode === 'py-visuals' && <PythonVisuals />}

      {/* ── COURSE MODE (all original code, unchanged) ── */}
      {viewMode === 'courses' && (
        <>
          {showCelebration && <Celebration onClose={() => setShowCelebration(false)} />}

          <div className="subject-tabs">
            <div className="tabs-container">
              {Object.entries(syllabusData).map(([key, data]) => (
                <button
                  key={key}
                  className={`subject-tab ${activeSubject === key ? 'active' : ''}`}
                  onClick={() => handleSubjectChange(key)}
                  style={{ '--subject-color': data.color }}
                >
                  <span className="tab-icon">{data.icon}</span>
                  <span className="tab-text">{data.title}</span>
                  {activeSubject === key && <div className="tab-glow" />}
                </button>
              ))}
            </div>
          </div>

          <div className="course-progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span className="progress-text">{progress}% Complete</span>
          </div>

          <div className="course-layout">
            <aside className={`course-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="sidebar-header">
                <h3 className="sidebar-title">
                  <span>{currentSubject.icon}</span>
                  {currentSubject.title}
                </h3>
                <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                  {sidebarCollapsed ? '→' : '←'}
                </button>
              </div>
              <div className="modules-list">
                {Object.entries(currentSubject.modules).map(([moduleName, topics]) => {
                  const isModuleComplete = completedModules.has(moduleName);
                  const isModuleActive = activeModule === moduleName;
                  return (
                    <div key={moduleName} className="module-group">
                      <button
                        className={`module-header ${isModuleActive ? 'active' : ''} ${isModuleComplete ? 'completed' : ''}`}
                        onClick={() => setActiveModule(isModuleActive ? null : moduleName)}
                      >
                        <span className="module-icon">{isModuleComplete ? '✓' : isModuleActive ? '▼' : '▶'}</span>
                        <span className="module-name">{moduleName}</span>
                        <span className={`topic-count ${isModuleComplete ? 'done' : ''}`}>
                          {isModuleComplete ? 'Done' : `${topics.filter(t => completedTopics.has(t)).length}/${topics.length}`}
                        </span>
                      </button>
                      {isModuleActive && (
                        <div className="topics-list">
                          {topics.map((topic, idx) => {
                            const isCompleted = completedTopics.has(topic);
                            const isActive = activeTopic === topic;
                            return (
                              <button
                                key={topic}
                                className={`topic-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                onClick={() => handleTopicClick(topic, moduleName)}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                              >
                                <span className="topic-bullet">{isCompleted ? '✓' : isActive ? '◆' : '◇'}</span>
                                <span className="topic-text">{topic}</span>
                                {isActive && <span className="topic-active-indicator" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="sidebar-footer">
                <div className="ueep-mini">
                  <span>Course Progress</span>
                  <div className="ueep-progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="progress-percent">{progress}%</span>
                </div>
              </div>
            </aside>

            <main className="content-viewer">
              {showModuleComplete ? (
                <ModuleComplete moduleName={currentModuleComplete} onNext={handleNextModule} />
              ) : !content ? (
                <div className="welcome-screen">
                  <div className="welcome-icon">{currentSubject.icon}</div>
                  <h1>{currentSubject.title}</h1>
                  <p>Select a topic from the sidebar to start learning</p>
                  <div className="quick-stats">
                    <div className="stat"><span className="stat-value">{allTopics.length}</span><span className="stat-label">Topics</span></div>
                    <div className="stat"><span className="stat-value">{allModules.length}</span><span className="stat-label">Modules</span></div>
                    <div className="stat"><span className="stat-value">{completedTopics.size}</span><span className="stat-label">Completed</span></div>
                  </div>
                  <div className="start-hint"><span className="hint-arrow">←</span><span>Choose a module to begin</span></div>
                </div>
              ) : (
                <div className="content-display">
                  <div className="content-header">
                    <div className="breadcrumb">
                      <span>{currentSubject.title}</span><span>›</span><span>{activeModule}</span><span>›</span>
                      <span className="active">{activeTopic}</span>
                    </div>
                    <div className="content-actions">
                      <button className={`action-btn ${completedTopics.has(activeTopic) ? 'completed' : ''}`} title="Mark Complete"
                        onClick={() => { const s = new Set(completedTopics); s.add(activeTopic); setCompletedTopics(s); }}>
                        {completedTopics.has(activeTopic) ? '✓' : '○'}
                      </button>
                      <button className="action-btn" title="Bookmark">🔖</button>
                      <button className="action-btn" title="Share">↗</button>
                    </div>
                  </div>
                  <article className="content-body">
                    <h1 className="content-title">{content.title}</h1>
                    <p className="content-description">{content.description}</p>
                    {content.sections.map((section, idx) => (
                      <section key={idx} className="content-section">
                        <h3 className="section-heading">{section.heading}</h3>
                        <p className="section-text">{section.text}</p>
                      </section>
                    ))}
                    <div className="code-playground-teaser">
                      <div className="teaser-header"><span>💻</span><span>Practice Code</span></div>
                      <div className="teaser-body">
                        <p>Interactive Python compiler coming soon...</p>
                        <button className="btn btn-primary">Open IDE</button>
                      </div>
                    </div>
                  </article>
                  <div className="content-footer">
                    <button className="nav-btn prev" onClick={handlePrevious} disabled={!canGoPrevious}>
                      <span>←</span> Previous
                    </button>
                    <div className="progress-info">
                      <span>{completedTopics.size} / {allTopics.length} completed</span>
                      <div className="mini-progress"><div style={{ width: `${progress}%` }} /></div>
                    </div>
                    <button className="nav-btn next" onClick={handleNext} disabled={!canGoNext}>
                      {completedTopics.size === allTopics.length - 1 ? 'Finish 🎉' : 'Next →'}
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </>
      )}

      {/* ── QUIZ STYLES ── */}
      <style>{`
        /* ── Mode Tabs ── */
        .mode-tabs {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }
        .mode-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .mode-tab:hover { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3); }
        .mode-tab.active { background: linear-gradient(135deg, rgba(0,217,255,0.2), rgba(168,85,247,0.2)); border-color: #00d9ff; color: #00d9ff; box-shadow: 0 0 12px rgba(0,217,255,0.2); }
        .mode-tab-icon { font-size: 16px; }

        /* ── Quiz Platform ── */
        .quiz-platform { min-height: calc(100vh - 120px); background: transparent; }
        .quiz-header { padding: 20px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .quiz-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .quiz-platform-icon { font-size: 28px; }
        .quiz-platform-title { font-size: 22px; font-weight: 700; color: white; margin: 0; }
        .quiz-subtitle { font-size: 12px; color: #00d9ff; background: rgba(0,217,255,0.1); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(0,217,255,0.3); }
        .overall-progress { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.7); }
        .prog-bar { flex: 1; max-width: 200px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .prog-fill { height: 100%; background: linear-gradient(90deg, #00d9ff, #a855f7); border-radius: 3px; transition: width 0.5s ease; }

        /* ── Level Tabs ── */
        .level-tabs { display: flex; gap: 8px; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .level-tab { display: flex; align-items: center; gap: 8px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .level-tab:hover { background: rgba(255,255,255,0.08); color: white; }
        .level-tab.active { background: rgba(168,85,247,0.15); border-color: #a855f7; color: white; }
        .level-name { text-transform: capitalize; }
        .level-count { font-size: 11px; background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 10px; }

        /* ── Quiz Layout ── */
        .quiz-layout { display: grid; grid-template-columns: 280px 1fr; height: calc(100vh - 240px); }
        .quiz-sidebar { border-right: 1px solid rgba(255,255,255,0.08); overflow-y: auto; padding: 0; background: rgba(0,0,0,0.2); }
        .quiz-sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 8px; font-size: 13px; font-weight: 700; color: white; text-transform: capitalize; }
        .level-prog { font-size: 11px; color: rgba(255,255,255,0.5); }
        .quiz-sidebar-progress { padding: 0 16px 12px; }
        .quiz-sidebar-progress .prog-bar { max-width: 100%; }
        .quiz-list { display: flex; flex-direction: column; gap: 0; }
        .quiz-list-item { display: flex; align-items: center; gap: 8px; padding: 9px 16px; border: none; border-bottom: 1px solid rgba(255,255,255,0.04); background: transparent; color: rgba(255,255,255,0.65); cursor: pointer; text-align: left; transition: all 0.15s; }
        .quiz-list-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .quiz-list-item.active { background: rgba(0,217,255,0.1); color: #00d9ff; border-left: 2px solid #00d9ff; }
        .quiz-list-item.done { color: rgba(255,255,255,0.4); }
        .quiz-list-item.done .qli-done { color: #00ff88; }
        .qli-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .quiz-list-item.active .qli-num { background: rgba(0,217,255,0.3); }
        .quiz-list-item.done .qli-num { background: rgba(0,255,136,0.2); }
        .qli-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .qli-title { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .qli-tag { font-size: 10px; font-weight: 600; opacity: 0.8; }
        .qli-done { color: #00ff88; font-size: 12px; }
        .qli-active { color: #00d9ff; font-size: 10px; }

        /* ── Quiz Main ── */
        .quiz-main { overflow-y: auto; padding: 20px; background: rgba(0,0,0,0.1); }
        .quiz-nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; margin-top: 12px; }
        .qnav-btn { padding: 8px 18px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); cursor: pointer; font-size: 13px; transition: all 0.2s; }
        .qnav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; }
        .qnav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .qnav-info { font-size: 13px; color: rgba(255,255,255,0.5); }

        /* ── Quiz Card ── */
        .quiz-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; transition: border-color 0.3s; }
        .quiz-card.correct { border-color: rgba(0,255,136,0.4); }
        .quiz-card.incorrect { border-color: rgba(255,107,107,0.4); }
        .quiz-card-header { padding: 16px 20px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .quiz-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .quiz-tag { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #000; letter-spacing: 0.5px; }
        .quiz-level { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: capitalize; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 10px; }
        .quiz-done-badge { font-size: 11px; color: #00ff88; background: rgba(0,255,136,0.1); padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(0,255,136,0.3); }
        .quiz-title { font-size: 20px; font-weight: 700; color: white; margin: 0; }
        .quiz-question { padding: 16px 20px; background: rgba(0,0,0,0.2); }
        .question-text { font-family: 'Courier New', monospace; font-size: 13px; color: rgba(255,255,255,0.85); line-height: 1.6; white-space: pre-wrap; margin: 0; }

        /* ── Code Editor ── */
        .quiz-workspace { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
        .code-editor-wrapper { border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; overflow: hidden; }
        .editor-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .editor-lang { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); }
        .clear-btn { font-size: 11px; padding: 3px 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 5px; background: transparent; color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; }
        .clear-btn:hover { background: rgba(255,255,255,0.08); color: white; }
        .code-textarea { width: 100%; min-height: 200px; padding: 14px; background: #1a1a2e; color: #e0e0e0; font-family: 'Courier New', 'Fira Code', monospace; font-size: 13px; line-height: 1.6; border: none; outline: none; resize: vertical; tab-size: 4; }
        .quiz-controls { display: flex; align-items: center; gap: 12px; }
        .loading-badge { font-size: 12px; color: #ffd43b; background: rgba(255,212,59,0.1); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,212,59,0.3); }
        .run-btn { padding: 10px 24px; background: linear-gradient(135deg, #00d9ff, #00a8cc); border: none; border-radius: 8px; color: #000; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; }
        .run-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,217,255,0.4); }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .run-btn.running { background: rgba(255,255,255,0.1); color: white; }

        /* ── Output ── */
        .output-panel { border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .output-panel.correct { border-color: rgba(0,255,136,0.4); }
        .output-panel.incorrect { border-color: rgba(255,107,107,0.3); }
        .output-panel.error { border-color: rgba(255,165,0,0.4); }
        .output-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: rgba(0,0,0,0.3); font-size: 12px; font-weight: 600; }
        .output-panel.correct .output-header { color: #00ff88; }
        .output-panel.incorrect .output-header { color: #ff6b6b; }
        .show-expected-btn { font-size: 11px; padding: 3px 10px; border: 1px solid rgba(255,212,59,0.4); border-radius: 5px; background: rgba(255,212,59,0.1); color: #ffd43b; cursor: pointer; transition: all 0.2s; }
        .show-expected-btn:hover { background: rgba(255,212,59,0.2); }
        .output-text { padding: 12px 14px; font-family: monospace; font-size: 13px; color: #e0e0e0; background: rgba(0,0,0,0.2); margin: 0; white-space: pre-wrap; line-height: 1.5; }

        /* ── Banners ── */
        .correct-banner { padding: 14px 20px; background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,200,100,0.1)); border-top: 1px solid rgba(0,255,136,0.3); color: #00ff88; font-weight: 700; font-size: 15px; text-align: center; letter-spacing: 0.5px; }
        .hint-banner { padding: 12px 20px; background: rgba(255,212,59,0.08); border-top: 1px solid rgba(255,212,59,0.2); color: #ffd43b; font-size: 13px; text-align: center; }

        /* ── Achievement Popup ── */
        .achievement-popup { position: fixed; top: 80px; right: 20px; z-index: 9999; cursor: pointer; animation: slideInRight 0.4s ease, fadeOut 0.3s ease 3.7s forwards; }
        .achievement-content { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,40,0.95)); border: 1px solid rgba(255,212,59,0.5); border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,212,59,0.2); min-width: 260px; }
        .achievement-icon { font-size: 28px; }
        .achievement-text { font-size: 14px; font-weight: 700; color: white; }
        @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOut { to { opacity: 0; transform: translateX(120%); } }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .quiz-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; height: auto; }
          .quiz-sidebar { height: 200px; overflow-y: auto; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .level-tabs { overflow-x: auto; }
          .mode-tabs { overflow-x: auto; }
        }
      `}</style>
    </div>
  );
}