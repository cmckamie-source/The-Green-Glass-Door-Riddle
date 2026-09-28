#ifndef ANSWERS_H
#define ANSWERS_H

#include <string>
#include <vector>
using namespace std;

class Answers {
public:
    vector<string> ruleAnswersLower();     // all lowercase
    vector<string> ruleAnswersUpper();     // all uppercase
    vector<string> ruleAnswersMixed();     // mixed case variations
    vector<string> ruleAnswersLoose();     // loose phrasing variations

    bool matchesAny(const string& guess, const vector<string>& list);
};

#endif