#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cctype>
#include"Answers.h"
#include <algorithm>

using namespace std;

struct AdjacentResult {
	bool has_adjacent = false;
	// pairs of (character, index of first of the adjacent pair)
	std::vector<std::pair<char,int>> pairs;
};

// Check for same letters back-to-back (adjacent duplicates)
AdjacentResult check_adjacent_duplicates(const std::string& word, bool case_sensitive = false) {
	AdjacentResult res;
	for (size_t i = 1; i < word.size(); ++i) {
		char a = case_sensitive ? word[i-1] : static_cast<char>(std::tolower(static_cast<unsigned char>(word[i-1])));
		char b = case_sensitive ? word[i]   : static_cast<char>(std::tolower(static_cast<unsigned char>(word[i])));
		if (a == b) {
			res.has_adjacent = true;
			res.pairs.emplace_back(a, static_cast<int>(i-1));
		}
	}
	return res;
}


int main() {
	std::string word;
	int attempts = 0;
	Answers answers; 

	cout << "Welcome to the Green Glass door!\n";
	cout << "In this riddle certain things can pass through the door and some can not\n";
		cout << "You can put a boot through the door but not a shoe. What can you put through the door?" << endl;

	auto normalize = [](std::string s) {
		// trim
		while (!s.empty() && std::isspace(static_cast<unsigned char>(s.front()))) s.erase(s.begin());
		while (!s.empty() && std::isspace(static_cast<unsigned char>(s.back()))) s.pop_back();
		for (auto &ch : s) ch = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
		return s;
	};

	while (true) {
		std::cout << "Enter a word (or Give Up to exit): ";
		if (!std::getline(std::cin, word) || word.empty()) break;

		// exit if user typed Give Up (allow minor spacing/case differences)
		std::string wnorm = normalize(word);
		if (wnorm == "give up") break;

		AdjacentResult adj = check_adjacent_duplicates(word);
		if (adj.has_adjacent) {
			std::cout << "Yes this can go through the Green Glass Door!" << std::endl;
		} else {
			std::cout << "No, this cannot go through the Green Glass Door." << std::endl;
		}
		
			std::string resp;
			std::cout << "Would you like to guess the riddle? (y/n): ";
			if (!std::getline(std::cin, resp)) break;

			if (normalize(resp) == "y" || normalize(resp) == "yes") {

				std::string guess;
				std::cout << "Enter your guess: ";
				if (!std::getline(std::cin, guess)) break;

				if (answers.matchesAny(guess, answers.ruleAnswersLower()) ||
					answers.matchesAny(guess, answers.ruleAnswersUpper()) ||
					answers.matchesAny(guess, answers.ruleAnswersMixed()) ||
					answers.matchesAny(guess, answers.ruleAnswersLoose()))
				{
					std::cout << "Congrats! you solved the riddle:)" << std::endl;
					break;
				}
				else {
					std::cout << "Try Again:(" << std::endl;
				}
			}
		
	}
	std::cout << "Thanks for playing the Green Glass Door!\n";
	std::cout << "Made by Christian McKamie" << std::endl;

	return 0;
}


