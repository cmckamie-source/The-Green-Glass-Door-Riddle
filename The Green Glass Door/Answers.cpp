#include "Answers.h"
#include <algorithm>

// -------------------------------
// LOWERCASE ANSWERS
// -------------------------------
vector<string> Answers::ruleAnswersLower() {
    return {
        "double letters",
        "repeated letters",
        "same letter twice",
        "consecutive letters",
        "double letter rule",
        "double characters"
    };
}

// -------------------------------
// UPPERCASE ANSWERS
// -------------------------------
vector<string> Answers::ruleAnswersUpper() {
    return {
        "DOUBLE LETTERS",
        "REPEATED LETTERS",
        "SAME LETTER TWICE",
        "CONSECUTIVE LETTERS",
        "DOUBLE LETTER RULE",
        "DOUBLE CHARACTERS"
    };
}

// -------------------------------
// MIXED CASE ANSWERS
// -------------------------------
vector<string> Answers::ruleAnswersMixed() {
    return {
        "Double Letters",
        "Repeated Letters",
        "Same Letter Twice",
        "Consecutive Letters",
        "Double Letter Rule",
        "Double Characters"
    };
}

// -------------------------------
// LOOSE / NATURAL LANGUAGE ANSWERS
// -------------------------------
vector<string> Answers::ruleAnswersLoose() {
    return {
        "words with double letters",
        "the word needs repeated letters",
        "letters must appear twice in a row",
        "the rule is double letters",
        "you can only bring words with double letters",
        "it’s about consecutive repeated letters",
        "the trick is double letters",
        "the puzzle uses doubled letters"
    };
}

// -------------------------------
// MATCH FUNCTION (case-insensitive)
// -------------------------------
bool Answers::matchesAny(const string& guess, const vector<string>& list) {
    string g = guess;

    // convert guess to lowercase
    transform(g.begin(), g.end(), g.begin(), ::tolower);

    for (string option : list) {
        // convert option to lowercase
        transform(option.begin(), option.end(), option.begin(), ::tolower);

        if (g == option) {
            return true;
        }
    }
    return false;
}