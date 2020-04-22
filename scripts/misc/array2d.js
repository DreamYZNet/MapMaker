
let Array2D = function () {

	this.createArray = function(width, height, fill = null) {
		let arr = []
		for (let y = 0; y < height; y++) {
			arr.push([])
			for (let x = 0; x < width; x++) {
				arr[y].push(fill)
			}
		}
		return arr
	}
	
	this.copy = function(arr) {
		let new_arr = [];
		for (row of arr)
			new_arr.push(row.slice());
		return new_arr;
	}
	
	this.numberfy = function(arr) {
		for (y in arr)
			for (x in arr[y])
				arr[y][x] = parseFloat(arr[y][x]);
	}
	
	this.alterSize = function(arr, left, right, up, down, fill) { //wip should these be set to zero by default?
		let min_size = 1;
		if (arr[0].length+left+right < min_size || arr.length+up+down < min_size) return false;
		if (left == 0 && right == 0 && up == 0 && down == 0) return true;
		alterArrayWidth(arr, left, right, fill)
		alterArrayHeight(arr, up, down, fill)
		return true;
	}
	
	this.validate = function(arr, width, height) {
		let result = {};
		if (arr.length != height)
			result.y = {intented:height, real:arr.length}
		result.x = [];
		for (let y = 0; y < arr.length; y++) {
			if (arr[y].length != width)
				result.x.push({intented:width, real:arr[y].length})
		}
		if (result.y || result.x.length != 0) {
			alert(validationString(result));
			return false;
		}else{
			return true;
		}
	}
	
	alterArrayWidth = function(arr, left, right, fill = null) { //wip we need to choose the correct order, first make map bigger, then smaller
		//if (left == 0 && right == 0 || arr[0].length+left+right < 1) return false; //sum could be 0
		for (let y = 0; y < arr.length; y++) {
			for (let i = 0; i < left; i++)
					arr[y].unshift(fill);
			for (let i = 0; i > left; i--)
					arr[y].shift();
			for (let i = 0; i < right; i++)
					arr[y].push(fill);
			for (let i = 0; i > right; i--)
					arr[y].pop();
		}
		return true
	}
	
	alterArrayHeight = function(arr, up, down, fill = null) {
		//if (up == 0 && down == 0 || arr.length+up+down < 1) return false; //sum shouldnt be 0
		for (let i = 0; i < up; i++)
				arr.unshift(new Array(arr[0].length).fill(fill));
		for (let i = 0; i > up; i--)
				arr.shift();
		for (let i = 0; i < down; i++)
				arr.push(new Array(arr[0].length).fill(fill));
		for (let i = 0; i > down; i--)
				arr.pop();
		return true
	}
	
	validationString = function(result) {
		let err_str = "WARNING:\nMAP DATA INCONSISTENT\nFILE CORRUPTED\nPROCEED AT YOUR OWN RISK!";
		let err_result = "";
		if (result.y)
			err_result += "\nheight:"+result.y.intended+" != arr height:"+result.y.real;
		for (x_res of result.x)
			err_result += "\nwidth:"+x_res.intended+" != arr width:"+x_res.real;
		return err_str+err_result;
	}
	
};