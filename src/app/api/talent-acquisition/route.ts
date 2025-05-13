import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    console.log('Talent Acquisition Form Data:', formData);

    // Here you would typically save the formData to a database
    // For example: await saveToDatabase(formData);

    return NextResponse.json({ message: 'Form submitted successfully', data: formData }, { status: 200 });
  } catch (error) {
    console.error('Error processing form submission:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error submitting form', error: errorMessage }, { status: 500 });
  }
}
