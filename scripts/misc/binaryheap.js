
let BinaryHeap = function(min_heap = true, key, compare) {
	
	// data
	let values = [];
	this.length = 0;
	
	// settings
	this.key = key;
	this.min_heap = min_heap;
	var compare;
	
	
	this.parentOf = function(index) {
		if (index < 1)
			return null
		return Math.floor((index-1)/2);
	}
	this.leftChildOf = function(index) {
		if (index < 0)
			return null
		return index*2+1;
	}
	this.rightChildOf = function(index) {
		if (index < 0)
			return null
		return index*2+2;
	}
	
	this.insert = function(value) {
		if (value == null) return false;
		values[this.length] = value;
		this.length++;
		//bubble up index
		let index = this.length-1;
		let parent = this.parentOf(index);
		while(index != 0 && compare(values[index], values[parent])) {
			swap(index, parent);
			index = parent;
			parent = this.parentOf(index);
		}
	}
	
	this.popTop = function() {
		if (this.length < 1) return null;
		let top = values[0];
		//move last element to root
		this.length--;
		values[0] = values[this.length];
		values[this.length] = null;
		//bubble down index
		let index = 0;
		let child;
		while(true) {
			let left_child = this.leftChildOf(index);
			let right_child = left_child+1;
			// Pick smaller of the two children, but not null
			if (!(left_child < this.length))
				break
			else if (right_child == this.length
					|| compare(values[left_child], values[right_child]))
				child = left_child;
			else
				child = right_child;
			// If the child value is less than the parent index, swap
			if (compare(values[child], values[index])) {
				swap(child, index);
				index = child;
			// If we can't swap the parent with either child, we've finished sorting it
			}else{
				break;
			}
		}
		return top;
	}
	
	this.find = function(element, index = 0) { // wip actually were not supposed to look for the same value, but the same object
		cnsl(index)
		// If we found our element
		if (values[index] == element) {
			return index;
		}
		let result = false;
		let left_child = this.leftChildOf(index);
		// If left child is null, so will the right child be
		if (values[left_child] == null)
			return false;
		let right_child = left_child+1;
		if (!compare(element, values[left_child]))
			result = result || this.find(element, left_child);
		// Only check right side if it isnt null
		if (values[right_child] != null)
			if (!compare(element, values[right_child]))
				result = result || this.find(element, right_child);
		return result;
	}
	
	// Returns true when the order is correct, false when they should be swapped
	this.setCompare = function(func) {
		if (func) {
			compare = func;
			return
		}
		if (this.key) {
			let key = this.key;
			if (this.min_heap)
				compare = function(parent, child) {
					return parent[key] < child[key];
				};
			else
				compare = function(parent, child) {
					return parent[key] > child[key];
				};
		}else{
			if (this.min_heap)
				compare = function(parent, child) {
					return parent < child;
				};
			else
				compare = function(parent, child) {
					return parent > child;
				};
		}
	}
	this.setKey = function(key) {
		this.key = key;
		this.setCompare();
	}
	this.setMinHeap = function(bool) {
		this.min_heap = bool;
		this.setCompare();
	}
	
	this.validate = function() {
		for (let i = 0; i < this.length; i++) {
			let left_child = this.leftChildOf(i);
			let right_child = left_child+1;
			if (values[left_child] == null)
				return true;
			if (compare(values[left_child], values[i]))
				return false;
			if (values[right_child] == null)
				return true;
			if (compare(values[right_child], values[i]))
				return false;
		}
		return true;
	}
	
	this.stringify = function() {
		let str = '';
		let level = 0;
		for (let i = 0; i < this.length; i++) {
			str += values[i] + ' ';
			if (i >= this.levelToLength(level)-1) {
				level++;
				str += '\n';
			}
		}
		return str;
	}
	
	this.indexToLevel = function(index) {
		let total = 0;
		for (let i = 0; true; i++) {
			total += Math.pow(2, i);
			if (i < total)
				return i;
		}
	}
	this.levelToLength = function(level) {
		let total = 0;
		for (let i = 0; i <= level; i++)
			total += Math.pow(2, i);
		return total;
	}
	
	this.toArray = function() {
		return values.splice();
	}
	
	let swap = function(index1, index2) {
		let temp = values[index1];
		values[index1] = values[index2];
		values[index2] = temp;
	}
	
	if (!compare)
		this.setCompare();
	
};