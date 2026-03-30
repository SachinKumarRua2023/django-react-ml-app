// ============================================================
// QUIZ DATA — Python & MySQL Challenges
// ============================================================

export const pythonQuizzes = {
  basics: [
    { id:"pb1", level:"basics", tag:"DSA", title:"Reverse a List", question:"Write a function that reverses a list in-place without using built-in reverse().\nInput: [1,2,3,4,5]\nPrint the reversed list.", starterCode:'def reverse_list(lst):\n    # your code here\n    pass\n\nprint(reverse_list([1,2,3,4,5]))', expectedOutput:'[5, 4, 3, 2, 1]' },
    { id:"pb2", level:"basics", tag:"DSA", title:"Check Palindrome", question:"Write a function is_palindrome(s) that returns True if a string is a palindrome, False otherwise.\nTest with 'racecar' and 'hello'.", starterCode:'def is_palindrome(s):\n    # your code here\n    pass\n\nprint(is_palindrome(\'racecar\'))\nprint(is_palindrome(\'hello\'))', expectedOutput:'True\nFalse' },
    { id:"pb3", level:"basics", tag:"DSA", title:"Fibonacci Sequence", question:"Print the first 8 Fibonacci numbers starting from 0 using a loop.", starterCode:'# your code here', expectedOutput:'0 1 1 2 3 5 8 13' },
    { id:"pb4", level:"basics", tag:"DSA", title:"Find Duplicates", question:"Given a list [1,2,3,2,4,1,5], print all duplicate elements (unique duplicates, sorted).", starterCode:'lst = [1,2,3,2,4,1,5]\n# your code here', expectedOutput:'[1, 2]' },
    { id:"pb5", level:"basics", tag:"DSA", title:"Count Vowels", question:"Write a function that counts vowels in a string.\nTest: count_vowels('Hello World')", starterCode:'def count_vowels(s):\n    # your code here\n    pass\n\nprint(count_vowels(\'Hello World\'))', expectedOutput:'3' },
  ],
  intermediate: [
    { id:"pi1", level:"intermediate", tag:"DSA", title:"Binary Search", question:"Implement binary search. Search for 17 in [1,3,5,7,9,11,13,15,17,19].\nReturn the index.", starterCode:'def binary_search(arr, target):\n    # your code here\n    pass\n\nprint(binary_search([1,3,5,7,9,11,13,15,17,19], 17))', expectedOutput:'8' },
    { id:"pi2", level:"intermediate", tag:"DSA", title:"Merge Sort", question:"Implement merge sort and sort [38,27,43,3,9,82,10].", starterCode:'def merge_sort(arr):\n    # your code here\n    pass\n\nprint(merge_sort([38,27,43,3,9,82,10]))', expectedOutput:'[3, 9, 10, 27, 38, 43, 82]' },
  ],
  advanced: [
    { id:"pa1", level:"advanced", tag:"DSA", title:"Dijkstra's Shortest Path", question:"Dijkstra from node 0 in graph. Print shortest distances to all nodes.", starterCode:'import heapq\n\ndef dijkstra(graph, start):\n    dist = {n: float(\'inf\') for n in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if dist[u]+w < dist[v]:\n                dist[v] = dist[u]+w\n                heapq.heappush(pq,(dist[v],v))\n    return dist\n\ngraph = {0:[(1,4),(2,1)],1:[(3,1)],2:[(1,2),(3,5)],3:[]}\nfor k in sorted(dijkstra(graph,0)): print(f\'{k}: {dijkstra(graph,0)[k]}\')', expectedOutput:'0: 0\n1: 3\n2: 1\n3: 4' },
  ]
};

export const mysqlQuizzes = {
  basics: [
    { id:"mb1", level:"basics", tag:"DDL", title:"Create Database", question:"Write SQL to create a database named 'school'.", starterCode:'CREATE DATABASE school;', expectedOutput:"Database 'school' created successfully." },
    { id:"mb2", level:"basics", tag:"DDL", title:"Create Table", question:"Create a table 'students' with id (INT PK AUTO_INCREMENT), name (VARCHAR 100), age (INT).", starterCode:'CREATE TABLE students (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100),\n    age INT\n);', expectedOutput:"Table 'students' created successfully." },
  ],
  intermediate: [
    { id:"mi1", level:"intermediate", tag:"JOIN", title:"INNER JOIN", question:"Join students and grades tables on student_id. Select student name and grade.", starterCode:'SELECT s.name, g.grade\nFROM students s\nINNER JOIN grades g ON s.id = g.student_id;', expectedOutput:'Alice | 90\nBob | 85\nCharlie | 92' },
  ],
  advanced: [
    { id:"ma1", level:"advanced", tag:"OPTIMIZE", title:"EXPLAIN Query", question:"Use EXPLAIN to analyze a SELECT with WHERE clause. Show query plan.", starterCode:'EXPLAIN SELECT * FROM students WHERE age > 20;', expectedOutput:'id|select_type|table|type|key|rows\n1|SIMPLE|students|ALL|NULL|3' },
  ]
};
