# 🧠 CBTW Recruitment App

A modern recruitment platform built with [Next.js](https://nextjs.org) and [Amazon DynamoDB](https://aws.amazon.com/dynamodb/). This application streamlines the hiring workflow by enabling teams to manage job postings, candidate applications, and recruiter feedback in one place.

---

## 🚀 Features

- 📋 Post and manage job openings
- 👤 Track and update candidate applications
- 💬 Capture recruiter feedback
- ⚡ Built with Next.js for optimal performance
- ☁️ Uses DynamoDB for scalable, serverless data storage

---

## ⚙️ Environment Configuration

To run this app, you'll need valid AWS credentials with access to DynamoDB. You can configure them via environment variables or AWS CLI.

### 1. Using `.env` file

Create a `.env` file at the root of your project:

```env
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
DYNAMO_TABLE_NAME=CBTWRecruitment
PORT=5009
```
