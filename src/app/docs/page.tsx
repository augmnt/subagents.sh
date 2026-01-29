import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Learn how to discover, install, and use Claude Code subagents to enhance your development workflow.',
  openGraph: {
    title: 'Documentation | Subagents.sh',
    description:
      'Learn how to discover, install, and use Claude Code subagents to enhance your development workflow.',
    type: 'article',
    url: 'https://subagents.sh/docs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation | Subagents.sh',
    description:
      'Learn how to discover, install, and use Claude Code subagents to enhance your development workflow.',
  },
};

export default function DocsPage() {
  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Documentation
        </h1>
        <p className="text-lg text-text-secondary">
          Learn how to discover, install, and use subagents
        </p>
      </div>

      {/* Content */}
      <div className="prose-dark space-y-12">
        {/* What are subagents */}
        <section>
          <h2>What are subagents?</h2>
          <p>
            Subagents are reusable capabilities for{' '}
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claude Code
            </a>
            . They extend Claude&apos;s abilities with specialized knowledge and
            workflows for specific tasks.
          </p>
          <p>
            Think of them as plugins or extensions that teach Claude new skills
            &mdash; from code review patterns to API design, testing strategies
            to deployment workflows.
          </p>
        </section>

        <hr />

        {/* Getting started */}
        <section>
          <h2>Getting started</h2>
          <p>Install any subagent with a single command:</p>
          <pre>
            <code>npx subagents-sh add owner/repo/subagent-name</code>
          </pre>
          <p>
            This downloads the subagent to{' '}
            <code>.claude/agents/</code> in your project directory.
          </p>
          <p>
            Once installed, Claude Code will automatically discover and use the
            subagent when relevant to your task. You can also explicitly
            reference it in your prompts.
          </p>
        </section>

        <hr />

        {/* Example */}
        <section>
          <h2>Example usage</h2>
          <p>
            After installing a subagent like <code>backend-architect</code>, you
            can ask Claude to use it:
          </p>
          <pre>
            <code>
              {`# Claude will automatically use the backend-architect subagent
# when you ask questions about API design

"Help me design a REST API for user authentication"`}
            </code>
          </pre>
          <p>
            The subagent provides specialized context and patterns that help
            Claude give more accurate, project-aware responses.
          </p>
        </section>

        <hr />

        {/* Managing subagents */}
        <section>
          <h2>Managing subagents</h2>
          <p>Common commands for working with subagents:</p>
          <pre>
            <code>
              {`# Install a subagent
npx subagents-sh add owner/repo/name

# List installed subagents
npx subagents-sh list

# Remove a subagent
npx subagents-sh remove owner/repo/name

# Update all subagents
npx subagents-sh update`}
            </code>
          </pre>
        </section>

        <hr />

        {/* How rankings work */}
        <section>
          <h2>How rankings work</h2>
          <p>
            The leaderboard is sorted by install count. We use anonymous
            telemetry from CLI installations to track popularity.
          </p>
          <p>
            <strong>No personal information is collected.</strong> We only track
            aggregate download counts to help surface the most useful subagents.
          </p>
        </section>

        <hr />

        {/* Creating subagents */}
        <section>
          <h2>Creating your own subagents</h2>
          <p>
            Subagents are markdown files with YAML frontmatter. Here&apos;s the
            format:
          </p>
          <pre>
            <code>
              {`---
name: "Your Agent Name"
description: "Brief description of what this agent does"
tools:
  - Read
  - Write
  - Bash
---

# Agent Instructions

Your detailed instructions here...

## Guidelines

- Specific patterns to follow
- Best practices
- Examples of usage`}
            </code>
          </pre>
        </section>

        <hr />

        {/* File format specification */}
        <section>
          <h2>File format specification</h2>
          <p>The frontmatter supports these fields:</p>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>name</code></td>
                <td>Yes</td>
                <td>Human-readable name for the subagent</td>
              </tr>
              <tr>
                <td><code>description</code></td>
                <td>No</td>
                <td>Brief description shown in listings</td>
              </tr>
              <tr>
                <td><code>tools</code></td>
                <td>No</td>
                <td>Array of Claude Code tools the agent uses</td>
              </tr>
            </tbody>
          </table>
          <p>
            The markdown body contains the actual instructions that will be
            loaded into Claude Code&apos;s context when the subagent is active.
          </p>
        </section>

        <hr />

        {/* Publishing subagents */}
        <section>
          <h2>Publishing your subagent</h2>
          <p>
            Sharing your subagent is simple &mdash; no approval process required:
          </p>
          <ol>
            <li>
              <strong>Create your subagent file</strong> following the format
              above
            </li>
            <li>
              <strong>Host it on GitHub</strong> in one of these locations:
              <ul>
                <li><code>.claude/agents/</code> (recommended)</li>
                <li><code>agents/</code></li>
                <li>Repository root</li>
              </ul>
            </li>
            <li>
              <strong>Share the install command</strong>:
              <pre>
                <code>npx subagents-sh add your-username/your-repo/agent-name</code>
              </pre>
            </li>
          </ol>
          <p>
            Your subagent will automatically appear on the{' '}
            <a href="/">leaderboard</a> as people install it. Rankings are based
            on install counts.
          </p>
        </section>
      </div>
    </div>
  );
}
