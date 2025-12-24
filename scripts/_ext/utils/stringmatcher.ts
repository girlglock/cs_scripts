export class StringMatcher {
    static levenshteinDistance(a: string, b: string): number {
        const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [i]);
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                matrix[i][j] = b[i - 1] === a[j - 1]
                    ? matrix[i - 1][j - 1]
                    : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
            }
        }
        return matrix[b.length][a.length];
    }

    static findClosest<T extends Record<string, any>>(query: string, items: T[], nameProperty: keyof T = "name"): T | null {
        if (!query?.trim()) return null;

        const normalizedQuery = query.toLowerCase().trim();
        const threshold = Math.max(3, normalizedQuery.length * 0.4);

        for (const item of items) {
            const val = String(item[nameProperty]).toLowerCase();
            if (val.includes(normalizedQuery)) {
                return item;
            }
        }

        let bestMatch: T | null = null;
        let minDistance = Infinity;

        for (const item of items) {
            const distance = this.levenshteinDistance(normalizedQuery, String(item[nameProperty]).toLowerCase());
            if (distance < minDistance && distance <= threshold) {
                minDistance = distance;
                bestMatch = item;
            }
        }

        return bestMatch;
    }
}