import heapq
from collections import defaultdict

class HuffmanNode:
    def __init__(self, char=None, freq=0, left=None, right=None):
        self.char = char
        self.freq = freq
        self.left = left
        self.right = right
    
    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(frequencies):
    heap = []
    for char, freq in frequencies.items():
        heapq.heappush(heap, HuffmanNode(char, freq))
    
    while len(heap) > 1:
        node1 = heapq.heappop(heap)
        node2 = heapq.heappop(heap)
        
        merged = HuffmanNode(freq=node1.freq + node2.freq, left=node1, right=node2)
        heapq.heappush(heap, merged)
    
    return heap[0] if heap else None

def generate_codes(root):
    codes = {}
    
    def traverse(node, current_code=""):
        if node is None:
            return
        
        if node.char is not None:
            codes[node.char] = current_code
            return
        
        traverse(node.left, current_code + "0")
        traverse(node.right, current_code + "1")
    
    traverse(root)
    return codes

def compute_average_code_length(codes, frequencies):
    total_freq = sum(frequencies.values())
    avg_length = 0
    for char, code in codes.items():
        avg_length += len(code) * frequencies[char]
    return avg_length / total_freq

def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [1]
    fib = [1, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

def solve_huffman_for_fibonacci(n):
    fib = fibonacci(n)
    chars = [chr(ord('a') + i) for i in range(n)]
    frequencies = dict(zip(chars, fib))
    
    print(f"First {n} Fibonacci numbers as frequencies:")
    for char, freq in frequencies.items():
        print(f"  {char}: {freq}")
    
    root = build_huffman_tree(frequencies)
    codes = generate_codes(root)
    
    print("\nOptimal Huffman codes:")
    for char in sorted(codes.keys()):
        print(f"  {char}: {codes[char]}")
    
    avg_length = compute_average_code_length(codes, frequencies)
    print(f"\nAverage code length: {avg_length:.2f}")
    
    return codes, avg_length

if __name__ == "__main__":
    print("=" * 60)
    print("Problem 16.3-3: Huffman Code for Fibonacci Frequencies")
    print("=" * 60)
    
    print("\n--- Part 1: First 8 Fibonacci numbers ---")
    codes_8, avg_8 = solve_huffman_for_fibonacci(8)
    
    print("\n" + "=" * 60)
    print("Generalization Analysis")
    print("=" * 60)
    
    for n in range(2, 11):
        fib = fibonacci(n)
        chars = [chr(ord('a') + i) for i in range(n)]
        frequencies = dict(zip(chars, fib))
        root = build_huffman_tree(frequencies)
        codes = generate_codes(root)
        
        print(f"\nFor n={n} (fib: {fib}):")
        for char in sorted(codes.keys()):
            print(f"  {char}: {codes[char]} (length: {len(codes[char])})")
        
        avg_length = compute_average_code_length(codes, frequencies)
        print(f"  Average length: {avg_length:.3f}")
    
    print("\n" + "=" * 60)
    print("Pattern Observation")
    print("=" * 60)
    print("\nFor Fibonacci frequencies F₁=1, F₂=1, F₃=2, ..., Fₙ (ascending order):")
    print("- The character with frequency Fₙ (largest) gets code: '1'")
    print("- The character with frequency Fₙ₋₁ gets code: '01'")
    print("- The character with frequency Fₙ₋₂ gets code: '001'")
    print("- ...")
    print("- The character with frequency F₂ gets code: '0'*(n-2) + '1'")
    print("- The character with frequency F₁ gets code: '0'*(n-1)")
    print("\nGeneral formula for position i (1-indexed, starting from smallest):")
    print(f"  Code length for position i = n - i")
    print(f"  Code = '0' * (n - i - 1) + '1' for i > 1")
    print(f"  Code = '0' * (n - 1) for i = 1")