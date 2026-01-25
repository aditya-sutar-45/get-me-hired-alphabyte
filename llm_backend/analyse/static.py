import lizard

code = """
int findMax(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}
"""
analysis = lizard.analyze_file.analyze_source_code("test.c", code)

for func in analysis.function_list:
    print(f"Function: {func.name}")
    print(f"Cyclomatic Complexity (CCN): {func.cyclomatic_complexity}")
    print(f"Lines of Code (NLOC): {func.nloc}")
    print(f"Token Count: {func.token_count}")
    print(f"Parameters: {func.parameter_count}")
