// p=obfuscatedFunction
// a=n1
// c=maxBase62
// k=wordDictionary
// e=base62Encode
// d=lookUpTable
eval(
	function(obfuscatedFunction, n1, maxBase62, wordDictionary, base62Encode, lookUpTable) {
		// function to convert integer to base-62
		base62Encode = function(nTemp) {
			return 
			// if nTemp < 62, we can start return
			(nTemp < n1 ? '' : base62Encode(parseInt(nTemp / n1)))
			+
			(
				// n1 is always equal to 62
				// 29 = 0x1d
				// base-36 if nTemp is a base-36 character, else
				//     'A' + letter #
				// this is so that we can cover all alphanumeric characters (assuming toString(36) returns lowercase)
				(nTemp = nTemp % n1) > 35 ? String.fromCharCode(nTemp + 29) : c.toString(36)
			)
		};
		
		// if (true) ??? idk how regexps work
		if (!''.replace(/^/, String)) {
			// build look up table
			// should start at 1n (85) and go to 0
			//   if item is not in dictionary (if dictionary string is '') then just pass the value through
			while (maxBase62--) { lookUpTable[base62Encode(maxBase62)] = wordDictionary[maxBase62] || base62Encode(maxBase62) }
			
			// at this point wordDictionary stops being the word dictionary
			//   and instead becomes an array containing a function that looks up its parameter in the LUT
			wordDictionary = [function(indexLUT) { return lookUpTable[indexLUT] }];
			
			base62Encode = function() {	return '\\w+' }; // regexp shenanigans
			
			maxBase62 = 1
		};
		
		// ^^^^ this runs once since maxBase62 = 1
		while (maxBase62--) {
			// maxBase62=0
			if (wordDictionary[maxBase62]) {
				// matches a string of alphanumerics and uses the LUT to look up the
				//   wordDictionary[maxBase62] looks up the string in the LUT
				
				obfuscatedFunction = obfuscatedFunction.replace(new RegExp('\\b' + base62Encode(maxBase62) + '\\b', 'g'), wordDictionary[maxBase62])
				
				// equivalent to
				// obfuscatedFunction = obfuscatedFunction.replace(new RegExp('\\b\\w+\\b', 'g'), function (indexLUT){return lookUpTable[indexLUT];})
			}
		}
		
		// returns the deobfuscated function
		return obfuscatedFunction
		// equal to the following:
		/*
		function main()
		{
			console.log("Time to learn about the Movember organization.");
			var factsAboutMovember=
				["A fancy way to say shaving is pogonotomy.",
				 "In a deck of cards the King of Hearts is the only king without a mustache.",
				 "A man spends an average of five months of his life shaving if he starts at the age of 14",
				 "Movember is not sponsoring QHacks."
				];
			factsAboutMovember.remove(factsAboutMovember[3]);
			displayFacts();
			var anotherFact="The oldest recorded mustache dates back to at around 300 B.C.";
			factsAboutMovember.push(anotherFact);
			displayFacts();
			if(factsAboutMovember.contains(anotherFact)){learnMoreAboutTheTopic()}
		}
		function displayFacts()
		{
			for(var fact in factsAboutMovember){
				console.log(fact+"!")
			}
		}
		function learnMoreAboutTheTopic(){
			window.location.replace("https://ca.movember.com/")
		}
		Array.prototype.remove=function(needle){
			var index=this.indexOf(needle);
			if(index>-1){
				this.splice(index,1);
				return this
			}
			return this
		}
		main();
		Array.prototype.contains=function(needle){
			for(i in this){
				if(this[i]==needle)
					return true
			}
			return false
		}
		*/
	}(
		'5 t(){k.h("G e H Y 7 m T.");6 2=["A S N e M n f Z.","Q a R 4 P 7 O 4 X f 7 W U V a l.","A L z D y 4 x K 4 J E n 8 I F o 7 1d 4 14","m f 1j 1i 1h."];2.r(2[3]);g();6 c="1f 1l 1g l 10 1m e o 1n 1e B.C.";2.16(c);g();8(2.u(c)){p()}}5 g(){q(6 j w 2){k.h(j+"!")}}5 p(){15.13.11("12://17.18.1c/")}v.s.r=5(b){6 d=0.1b(b);8(d>-1){0.1a(d,1);9 0}9 0}t();v.s.u=5(b){q(i w 0){8(0[i]==b)9 19}9 1k}',
		62, 
		86, 
		'this||factsAboutMovember||of|function|var|the|if|return||needle|anotherFact|index|to|is|displayFacts|log||fact|console|mustache|Movember|shaving|at|learnMoreAboutTheTopic|for|remove|prototype|main|contains|Array|in|five|average|spends||||an|life|starts|Time|learn|he|his|months|man|say|way|King|cards|In|deck|fancy|organization|king|without|only|Hearts|about|pogonotomy|dates|replace|https|location||window|push|ca|movember|true|splice|indexOf|com|age|300|The|recorded|QHacks|sponsoring|not|false|oldest|back|around'.split('|'),
		0,
		{}
	)
)
// it eval's the de-obfuscated function

/*
Time to learn about the Movember organization.
A fancy way to say shaving is pogonotomy.!
In a deck of cards the King of Hearts is the only king without a mustache.!
A man spends an average of five months of his life shaving if he starts at the age of 14!
A fancy way to say shaving is pogonotomy.!
In a deck of cards the King of Hearts is the only king without a mustache.!
A man spends an average of five months of his life shaving if he starts at the age of 14!
The oldest recorded mustache dates back to at around 300 B.C.
--- END OF OUTPUT
It should then crash because Array.prototype.contains doesn't exist yet.
*/