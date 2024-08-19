export class IFFluxQueryBuilder {
  private queryParts: string[] = [];

  from(bucket: string): this {
    this.queryParts.push(`from(bucket: "${bucket}")`);
    return this;
  }

  range(start: string): this {
    this.queryParts.push(`|> range(start: ${start})`);
    return this;
  }

  filter(field: string, value: string): this {
    this.queryParts.push(`|> filter(fn: (r) => r.${field} == "${value}")`);
    return this;
  }

  keep(columns: string[]): this {
    const cols = columns.map((col) => `"${col}"`).join(', ');
    this.queryParts.push(`|> keep(columns: [${cols}])`);
    return this;
  }

  rename(columns: Record<string, string>): this {
    const renameMap = Object.entries(columns)
      .map(([oldCol, newCol]) => `${oldCol}: "${newCol}"`)
      .join(', ');
    this.queryParts.push(`|> rename(columns: {${renameMap}})`);
    return this;
  }

  join(tables: Record<string, string>, on: string[]): this {
    const tableNames = Object.entries(tables)
      .map(([name, table]) => `${name}: (${table})`) // join 안에 포함될 테이블에 괄호 추가
      .join(', ');
    const onCols = on.map((col) => `"${col}"`).join(', ');
    this.queryParts.push(`join(tables: {${tableNames}}, on: [${onCols}])`);
    return this;
  }

  build(): string {
    return this.queryParts.join('\n');
  }

  reset(): this {
    this.queryParts = [];
    return this;
  }
}
