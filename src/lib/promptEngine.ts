// --- Interfaces & Types ---

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

/**
 * Interface for a Vector Database adapter.
 * Implement this interface to connect to Pinecone, Milvus, etc.
 */
export interface IVectorStore {
  search(query: string, limit?: number): Promise<VectorSearchResult[]>;
}

export interface PromptOptions {
  templateId: string;
  variables?: Record<string, string | number>;
  ragQuery?: string; // If provided, RAG logic is triggered
  ragLimit?: number; // How many context chunks to retrieve
}

// --- The Engine Class ---

export class PromptEngine {
  private templates: Map<string, string>;
  private vectorStore: IVectorStore | null;

  /**
   * @param vectorStore - Optional. If omitted, RAG features will throw a warning or be skipped.
   */
  constructor(vectorStore?: IVectorStore) {
    this.templates = new Map();
    this.vectorStore = vectorStore || null;
  }

  /**
   * Registers a reusable prompt template.
   * Templates should use {{variableName}} syntax.
   * Reserved variable for RAG: {{context}}
   */
  public registerTemplate(id: string, templateContent: string): void {
    this.templates.set(id, templateContent);
  }

  /**
   * The main method to build the final prompt string.
   * 1. Fetches the template.
   * 2. Retrieves context from Vector Store (if ragQuery is present).
   * 3. Interpolates variables and context.
   */
  public async build(options: PromptOptions): Promise<string> {
    const { templateId, variables = {}, ragQuery, ragLimit = 3 } = options;

    // 1. Validate Template
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template with ID '${templateId}' not found.`);
    }

    // 2. Handle RAG (Context Retrieval)
    let contextString = "";
    if (ragQuery) {
      if (!this.vectorStore) {
        console.warn("RAG query provided but no VectorStore configured.");
      } else {
        const results = await this.vectorStore.search(ragQuery, ragLimit);
        contextString = this.formatContext(results);
      }
    }

    // 3. Merge Variables (User variables + RAG Context)
    const finalVariables = {
      ...variables,
      context: contextString, // Automatically inject context if {{context}} exists
    };

    // 4. Interpolate and Return
    return this.interpolate(template, finalVariables);
  }

  /**
   * Formats the vector search results into a string suitable for LLM consumption.
   * Usually formatted as a list of "Document [n]: ...content..."
   */
  private formatContext(results: VectorSearchResult[]): string {
    if (results.length === 0) return "No relevant context found.";

    return results
      .map((doc, index) => `[Context ${index + 1}]: ${doc.content}`)
      .join("\n\n");
  }

  /**
   * Replaces {{key}} in the template with values from the variables object.
   */
  private interpolate(
    template: string,
    variables: Record<string, string | number>
  ): string {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      const value = variables[key];
      return value !== undefined ? String(value) : match; // Keep tag if var missing
    });
  }
}

// --- Usage Example (Mocking the DB) ---

// 1. Create a Mock Vector Store (In reality, this would call your DB SDK)
class MockVectorStore implements IVectorStore {
  async search(query: string, limit: number): Promise<VectorSearchResult[]> {
    // Simulate async DB call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "doc-1",
            score: 0.92,
            content: "TypeScript is a strict syntactical superset of JavaScript.",
          },
          {
            id: "doc-2",
            score: 0.85,
            content: "tRPC allows you to build end-to-end typesafe APIs.",
          },
        ].slice(0, limit));
      }, 50); // 50ms simulated latency
    });
  }
}

// 2. Initialize and Run
async function main() {
  // Initialize Engine with the mock store
  const engine = new PromptEngine(new MockVectorStore());

  // Register a Template (Note the {{context}} tag)
  engine.registerTemplate(
    "technical-qa",
    `You are a technical assistant. Answer the user's question using the context below.
    
Context:
{{context}}

User Question: {{question}}
Answer:`
  );

  // Build the Prompt
  const prompt = await engine.build({
    templateId: "technical-qa",
    ragQuery: "What is TypeScript?", // This triggers the vector search
    variables: {
      question: "How does TypeScript relate to JS?",
    },
  });

  console.log("--- Generated Prompt ---");
  console.log(prompt);
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}