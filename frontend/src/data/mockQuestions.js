// Question Bank for Tech Placement Preparation
// Contains questions for OS, DBMS, Networks, System Design, and Aptitude

export const questionsPool = {
    // ----------------------------------------------------
    // CORE CS FUNDAMENTALS
    // ----------------------------------------------------
    os: {
        easy: [
            {
                id: 'os-e1',
                question: 'Which of the following is NOT a state of a process?',
                options: ['New', 'Running', 'Waiting', 'Blocked', 'Interrupted'],
                correctOption: 4,
                explanation: 'Process states are New, Ready, Running, Waiting (or Blocked), and Terminated. Interrupted is a trigger event, not a persistent process state.'
            },
            {
                id: 'os-e2',
                question: 'What is the primary purpose of virtual memory?',
                options: [
                    'To allow execution of processes larger than physical memory',
                    'To increase the speed of RAM access',
                    'To automatically defragment the hard disk drive',
                    'To act as backup storage in case of power failure'
                ],
                correctOption: 0,
                explanation: 'Virtual memory separates user logical memory from physical memory, allowing processes larger than actual RAM capacity to execute using disk storage swapping.'
            },
            {
                id: 'os-e3',
                question: 'What is a thread?',
                options: [
                    'A heavy-weight process with separate address space',
                    'A basic unit of CPU utilization (light-weight process)',
                    'A hardware execution cable inside the CPU core',
                    'A security protocol that flags invalid page accesses'
                ],
                correctOption: 1,
                explanation: 'A thread is a path of execution within a process. It is a light-weight process sharing code, data, and resources with siblings.'
            },
            {
                id: 'os-e4',
                question: 'Which CPU scheduling algorithm is non-preemptive by default?',
                options: ['Round Robin', 'Shortest Remaining Time First', 'First Come First Served', 'Multilevel Feedback Queue'],
                correctOption: 2,
                explanation: 'First Come First Served (FCFS) runs processes strictly in the order they enter the ready queue and is non-preemptive.'
            },
            {
                id: 'os-e5',
                question: 'What is a system call?',
                options: [
                    'A phone line setup for remote server debugging',
                    'The programmatic interface between a running program and the Operating System kernel',
                    'A bootloader error code that triggers system diagnostics',
                    'An interrupt signal dispatched directly by external USB accessories'
                ],
                correctOption: 1,
                explanation: 'System calls provide the interface between a process and the OS kernel, enabling user space code to request privileged operations (like file reads or networking).'
            }
        ],
        medium: [
            {
                id: 'os-m1',
                question: 'What are the four necessary conditions for a deadlock to occur?',
                options: [
                    'Mutex, Hold and Wait, Preemption, Circular Wait',
                    'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
                    'Semaphores, Swapping, Dynamic Linking, Preemption',
                    'Multithreading, Sharing, Memory Protection, Context Switching'
                ],
                correctOption: 1,
                explanation: 'Deadlock requires: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. Removing any one of these conditions breaks/prevents deadlocks.'
            },
            {
                id: 'os-m2',
                question: 'What is Belady\'s Anomaly in page replacement algorithms?',
                options: [
                    'Page fault rate decreases as physical frame count increases',
                    'Page fault rate increases as physical frame count increases in FIFO',
                    'Context switching takes longer than process execution',
                    'Virtual memory size exceeds hardware memory limits'
                ],
                correctOption: 1,
                explanation: 'Belady\'s Anomaly occurs in FIFO replacement where allocating more page frames results in more page faults for certain access patterns.'
            },
            {
                id: 'os-m3',
                question: 'What is the main difference between a Mutex and a Semaphore?',
                options: [
                    'Mutex is a signaling mechanism, Semaphore is a locking mechanism',
                    'Mutex is a locking mechanism with ownership, Semaphore is a signaling count mechanism',
                    'Mutex can be accessed by multiple processes simultaneously, Semaphore is strictly binary',
                    'Mutex resides in user space, Semaphore is strictly handled in network interface hardware'
                ],
                correctOption: 1,
                explanation: 'A Mutex is a locking mechanism that allows only one thread to access a resource (ownership model). A Semaphore uses counts/signals to manage access pools.'
            },
            {
                id: 'os-m4',
                question: 'What is thrashing in operating systems?',
                options: [
                    'A severe error caused by physical hardware dust blockages',
                    'A state where the system spends more time page swapping than executing instructions',
                    'The automatic deletion of idle process threads to free memory space',
                    'A performance boost achieved by over-clocking CPU registry cycles'
                ],
                correctOption: 1,
                explanation: 'Thrashing occurs when memory is overcommitted. The OS spends nearly all its cycles swapping pages in and out of disk rather than running user processes.'
            }
        ],
        hard: [
            {
                id: 'os-h1',
                question: 'What is translation lookaside buffer (TLB) thrashing?',
                options: [
                    'Frequent TLB directory overrides caused by rapid context switching between processes with distinct page tables',
                    'A hardware compiler failure when writing kernel pointers to registry blocks',
                    'An infinite loop cycle in circular queue scheduling models',
                    'None of the above'
                ],
                correctOption: 0,
                explanation: 'TLB thrashing occurs when processes access more pages than the TLB can hold, resulting in continuous slow page table lookups on physical RAM.'
            },
            {
                id: 'os-h2',
                question: 'In the Banker\'s algorithm, what state is the system in if it cannot find a safe sequence?',
                options: ['Deadlocked state', 'Unsafe state (potential deadlock)', 'Terminated state', 'Starvation state'],
                correctOption: 1,
                explanation: 'An unsafe state is not necessarily a deadlock; it simply means the system cannot guarantee that a deadlock can be avoided if maximum resource requests occur.'
            }
        ]
    },
    dbms: {
        easy: [
            {
                id: 'dbms-e1',
                question: 'What does ACID stand for in DBMS transactions?',
                options: [
                    'Atomicity, Consistency, Isolation, Durability',
                    'Access, Compression, Indexes, Directories',
                    'Algorithm, Control, Integrity, Data-flow',
                    'Association, Constraints, Inheritance, Division'
                ],
                correctOption: 0,
                explanation: 'ACID guarantees database transaction reliability: Atomicity (all or nothing), Consistency (rules valid), Isolation (independent runs), and Durability (saved changes).'
            },
            {
                id: 'dbms-e2',
                question: 'Which SQL join returns all rows when there is a match in either left or right table?',
                options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
                correctOption: 3,
                explanation: 'FULL OUTER JOIN merges left and right rows, showing matching entries or filling missing parameters with NULL values.'
            },
            {
                id: 'dbms-e3',
                question: 'Which of the following is used to uniquely identify a record in a database table?',
                options: ['Foreign Key', 'Primary Key', 'Index Key', 'Check Constraint'],
                correctOption: 1,
                explanation: 'A Primary Key enforces unique values and denies NULL inputs, uniquely identifying individual table rows.'
            }
        ],
        medium: [
            {
                id: 'dbms-m1',
                question: 'What is 3NF (Third Normal Form) rule in database design?',
                options: [
                    'Table has no multi-valued attributes',
                    'Table is in 2NF and has no transitive dependencies for non-prime attributes',
                    'Table has primary keys and candidate keys separated into independent tables',
                    'Table is in 2NF and has all columns sorted in alphabetically unique orders'
                ],
                correctOption: 1,
                explanation: '3NF requires the table to be in 2NF, and all non-prime columns must depend directly on the primary key (no transitive functional dependency).'
            },
            {
                id: 'dbms-m2',
                question: 'What is the main difference between BCNF (Boyce-Codd Normal Form) and 3NF?',
                options: [
                    'BCNF is weaker than 3NF and allows partial dependencies',
                    'BCNF is a stronger version of 3NF where for every dependency A -> B, A must be a super key',
                    'BCNF allows multi-valued dependencies while 3NF restricts them',
                    'BCNF is strictly used for relational tables, while 3NF applies to file indices'
                ],
                correctOption: 1,
                explanation: 'BCNF is a stricter definition of 3NF. It eliminates anomalies when a table has overlapping candidate keys. For every non-trivial dependency A -> B, A must be a super key.'
            }
        ],
        hard: [
            {
                id: 'dbms-h1',
                question: 'What is a phantom read anomaly in databases?',
                options: [
                    'A transaction reads a row, and another transaction deletes it before commit',
                    'A transaction queries rows, another transaction inserts new rows matching criteria, first transaction re-queries and sees new rows',
                    'A transaction reads uncommitted changes written by another transaction',
                    'None of the above'
                ],
                correctOption: 1,
                explanation: 'Phantom reads occur when range queries yield different row sets within the same transaction because another transaction inserted matching records concurrently.'
            }
        ]
    },
    cn: {
        easy: [
            {
                id: 'cn-e1',
                question: 'How many layers are in the standard OSI model?',
                options: ['4 layers', '5 layers', '7 layers', '9 layers'],
                correctOption: 2,
                explanation: 'The OSI (Open Systems Interconnection) reference model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.'
            },
            {
                id: 'cn-e2',
                question: 'Which protocol operates at the Transport Layer of the OSI model?',
                options: ['HTTP', 'IP', 'TCP', 'ARP'],
                correctOption: 2,
                explanation: 'TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) operate at Layer 4 (Transport Layer) to manage host-to-host delivery.'
            },
            {
                id: 'cn-e3',
                question: 'What does DNS stand for?',
                options: ['Digital Network System', 'Domain Name System', 'Dynamic Node Service', 'Data Network Security'],
                correctOption: 1,
                explanation: 'DNS translates human-readable domain names (e.g. google.com) into numerical IP addresses (e.g. 142.250.190.46).'
            }
        ],
        medium: [
            {
                id: 'cn-m1',
                question: 'What is the main difference between TCP and UDP?',
                options: [
                    'TCP is faster but unreliable; UDP is slower and connection-oriented',
                    'TCP is connection-oriented, reliable, and uses flow control; UDP is connectionless and lightweight',
                    'TCP operates at the network layer; UDP operates at the application layer',
                    'TCP packet frames contain IP headers; UDP packet frames carry raw hardware MAC frames'
                ],
                correctOption: 1,
                explanation: 'TCP guarantees packet delivery via handshakes, sequencing, and retransmissions. UDP streams packets without checking connection status, optimized for speed.'
            },
            {
                id: 'cn-m2',
                question: 'What is the purpose of the Address Resolution Protocol (ARP)?',
                options: [
                    'To translate an IP address to a physical MAC address',
                    'To assign dynamic IP addresses to devices on a LAN',
                    'To route packet headers across wide area networks',
                    'To encrypt session packets on public Wi-Fi routes'
                ],
                correctOption: 0,
                explanation: 'ARP resolves network layer IPv4 addresses into corresponding data link layer MAC addresses inside local networks.'
            }
        ],
        hard: [
            {
                id: 'cn-h1',
                question: 'How does the TCP 3-Way Handshake connect two endpoints?',
                options: [
                    'Client sends SYN -> Server replies ACK -> Client completes SYN-ACK',
                    'Client sends SYN -> Server replies SYN-ACK -> Client completes ACK',
                    'Client sends ACK -> Server replies SYN -> Client completes SYN-ACK',
                    'None of the above'
                ],
                correctOption: 1,
                explanation: 'TCP connection setup: Client dispatches SYN (Synchronize), Server answers with SYN-ACK (Synchronize-Acknowledge), and Client sends back ACK (Acknowledge).'
            }
        ]
    },
    system_design: {
        easy: [
            {
                id: 'sd-e1',
                question: 'What is horizontal scaling (scaling out)?',
                options: [
                    'Adding more memory or CPU cores to a single machine',
                    'Adding more servers/machines to the system pool',
                    'Organizing database tables into column layouts',
                    'Reducing application bundle sizes to decrease load delays'
                ],
                correctOption: 1,
                explanation: 'Horizontal scaling adds more instances (machines) to handle traffic, whereas vertical scaling upgrades the resources (RAM/CPU) of a single server.'
            },
            {
                id: 'sd-e2',
                question: 'What does a Load Balancer do?',
                options: [
                    'It compiles network code to run on client CPUs',
                    'It distributes incoming network traffic across a pool of backend servers',
                    'It backups relational database tables to cloud drives',
                    'It regulates electrical voltage levels inside data centers'
                ],
                correctOption: 1,
                explanation: 'Load balancers sit between client requests and servers, distributing incoming network traffic evenly to prevent individual nodes from overloading.'
            }
        ],
        medium: [
            {
                id: 'sd-m1',
                question: 'What is the primary benefit of Database Replication?',
                options: [
                    'To increase write speeds of transactional systems',
                    'To provide high availability, fault tolerance, and read scalability',
                    'To normalize database schemas automatically to 3NF',
                    'To compress data blocks on storage disks'
                ],
                correctOption: 1,
                explanation: 'Replication copies database nodes. If the primary master node fails, a read replica can step in (high availability), and reads can be spread across replicas.'
            },
            {
                id: 'sd-m2',
                question: 'What is CDN (Content Delivery Network)?',
                options: [
                    'A compression format for video stream packets',
                    'A geographically distributed network of proxy servers that cache assets close to end users',
                    'A database engine optimized for document store lookups',
                    'A secure SSH terminal used to execute backend scripts'
                ],
                correctOption: 1,
                explanation: 'CDNs cache static assets (HTML, images, CSS, JS) at edge servers near the users, reducing latency and database requests.'
            }
        ],
        hard: [
            {
                id: 'sd-h1',
                question: 'What is the CAP Theorem in distributed databases?',
                options: [
                    'Compression, Architecture, Performance weights',
                    'A distributed system can only guarantee two of: Consistency, Availability, and Partition Tolerance',
                    'All tables must have Primary keys, Foreign keys, and Indexes',
                    'None of the above'
                ],
                correctOption: 1,
                explanation: 'CAP theorem states that in a distributed data store, under a network partition, you must choose either Consistency (CP) or Availability (AP).'
            }
        ]
    },

    // ----------------------------------------------------
    // APTITUDE ROUND PREP
    // ----------------------------------------------------
    logical: {
        easy: [
            {
                id: 'log-e1',
                question: 'If CAT is coded as 3120, how is DOG coded?',
                options: ['4157', '4156', '5168', '3157'],
                correctOption: 0,
                explanation: 'Letters are replaced by their alphabetical rank positions: C=3, A=1, T=20 (3120). Thus, D=4, O=15, G=7, resulting in 4157.'
            },
            {
                id: 'log-e2',
                question: 'Pointing to a photograph, a man says: "She is the daughter of the only son of my father." How is the woman related to the man?',
                options: ['Sister', 'Mother', 'Daughter', 'Granddaughter'],
                correctOption: 2,
                explanation: '"Only son of my father" refers to the man himself. Her being "the daughter of the only son" makes her the man\'s daughter.'
            }
        ],
        medium: [
            {
                id: 'log-m1',
                question: 'Find the missing number in the sequence: 2, 6, 12, 20, 30, ?, 56',
                options: ['38', '40', '42', '45'],
                correctOption: 2,
                explanation: 'The difference between terms increases by 2: (6-2)=4, (12-6)=6, (20-12)=8, (30-20)=10. The next difference is 12, so 30+12 = 42.'
            }
        ],
        hard: [
            {
                id: 'log-h1',
                question: 'A clock shows 4:30. If the minute hand points East, in which direction does the hour hand point?',
                options: ['North-East', 'South-West', 'North-West', 'South-East'],
                correctOption: 0,
                explanation: 'At 4:30, the minute hand points directly at 6 (South normally, but designated East here - rotated 90 degrees counter-clockwise). The hour hand is between 4 and 5 (normally South-East). Rotating it 90 degrees counter-clockwise places it pointing North-East.'
            }
        ]
    },
    language: {
        easy: [
            {
                id: 'lang-e1',
                question: 'Choose the antonym of the word: DILIGENT',
                options: ['Lazy', 'Hardworking', 'Smart', 'Active'],
                correctOption: 0,
                explanation: 'Diligent means showing care and effort in work. Lazy is the exact opposite.'
            },
            {
                id: 'lang-e2',
                question: 'Identify the synonym of the word: BRIEF',
                options: ['Long', 'Short', 'Detailed', 'Severe'],
                correctOption: 1,
                explanation: 'Brief means of short duration or concise. Short is the matching synonym.'
            }
        ],
        medium: [
            {
                id: 'lang-m1',
                question: 'Fill in the blank with the correct preposition: "The manager has agreed to look ______ the matter."',
                options: ['at', 'on', 'into', 'over'],
                correctOption: 2,
                explanation: '"Look into" is a phrasal verb meaning to investigate or audit, which fits the context of checking a matter.'
            }
        ],
        hard: [
            {
                id: 'lang-h1',
                question: 'Identify the grammatically correct sentence:',
                options: [
                    'Neither the teacher nor the students was present.',
                    'Neither the teacher nor the students were present.',
                    'Neither the teacher or the students were present.',
                    'Neither of the teacher or the students was present.'
                ],
                correctOption: 1,
                explanation: 'With "neither... nor", the verb agrees with the closer subject. Since "students" is plural, "were" is correct. Also, "neither" always pairs with "nor".'
            }
        ]
    },
    maths: {
        easy: [
            {
                id: 'mth-e1',
                question: 'A person crosses a 600m long street in 5 minutes. What is their speed in km/hr?',
                options: ['3.6 km/hr', '7.2 km/hr', '8.4 km/hr', '10 km/hr'],
                correctOption: 1,
                explanation: 'Speed = Distance/Time = 600m / (5 * 60)s = 2 m/s. Converting to km/hr: 2 * (18/5) = 7.2 km/hr.'
            },
            {
                id: 'mth-e2',
                question: 'What is the probability of getting an odd number when throwing a standard six-sided die?',
                options: ['1/2', '1/3', '2/3', '1/6'],
                correctOption: 0,
                explanation: 'Total outcomes = 6 {1,2,3,4,5,6}. Odd outcomes = 3 {1,3,5}. Probability = 3/6 = 1/2.'
            }
        ],
        medium: [
            {
                id: 'mth-m1',
                question: 'A can complete a work in 10 days, and B can complete it in 15 days. If they work together, in how many days will they finish?',
                options: ['5 days', '6 days', '7 days', '8 days'],
                correctOption: 1,
                explanation: 'Combined rate per day = (1/10 + 1/15) = (3+2)/30 = 5/30 = 1/6. Thus, working together they take 6 days.'
            }
        ],
        hard: [
            {
                id: 'mth-h1',
                question: 'In how many different ways can the letters of the word "LEADING" be arranged such that all the vowels always come together?',
                options: ['360', '720', '1440', '5040'],
                correctOption: 1,
                explanation: 'Vowels are E, A, I (3 vowels). Consonants are L, D, N, G (4 consonants). Treat the vowels as 1 single block. Total units to arrange = 4 + 1 = 5. Arrangements of 5 units = 5! = 120. Vowels within their block can arrange in 3! = 6 ways. Total arrangements = 120 * 6 = 720.'
            }
        ]
    }
};

// Shuffles an array in place
export const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Returns a subset of shuffled questions for a given subject, difficulty, and count
export const generateQuiz = (subject, difficulty, count = 30) => {
    const category = questionsPool[subject];
    if (!category) return [];

    let pool = [];
    if (difficulty === 'all') {
        // Pool all difficulties
        pool = [...(category.easy || []), ...(category.medium || []), ...(category.hard || [])];
    } else {
        pool = category[difficulty] || [];
    }

    if (pool.length === 0) return [];

    const shuffled = shuffleArray(pool);
    // Return up to 'count' elements, pad if pool is smaller than count by repeating shuffled elements
    let result = shuffled.slice(0, count);
    
    // In case pool is smaller than requested count, we repeat elements to ensure we give 'count' questions
    let index = 0;
    while (result.length < count && pool.length > 0) {
        result.push({ ...shuffled[index % shuffled.length], id: `${shuffled[index % shuffled.length].id}-clone-${result.length}` });
        index++;
    }

    return result;
};

// Generates a comprehensive final exam mixing all topics in CS or Aptitude
export const generateFinalExam = (type = 'cs', count = 30) => {
    let combinedPool = [];
    const csTopics = ['os', 'dbms', 'cn', 'system_design'];
    const aptTopics = ['logical', 'language', 'maths'];
    const topics = type === 'cs' ? csTopics : aptTopics;

    topics.forEach(topic => {
        const category = questionsPool[topic];
        if (category) {
            const allDifficultyQs = [...(category.easy || []), ...(category.medium || []), ...(category.hard || [])];
            combinedPool = [...combinedPool, ...allDifficultyQs];
        }
    });

    if (combinedPool.length === 0) return [];

    const shuffled = shuffleArray(combinedPool);
    let result = shuffled.slice(0, count);
    
    let index = 0;
    while (result.length < count && combinedPool.length > 0) {
        result.push({ ...shuffled[index % shuffled.length], id: `${shuffled[index % shuffled.length].id}-final-clone-${result.length}` });
        index++;
    }

    return result;
};
