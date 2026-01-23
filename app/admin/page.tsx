'use client'

import React, { useEffect, useState } from 'react'

interface MetricCardProps {
    title: string;
    value: string | number;
}

interface Question {
    text: string;
    count: number;
}

function MetricCard({ title, value }: MetricCardProps) {
    return (
        <div className="border rounded p-4">
            <p className="text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

const page = () => {
    const [topQuestions, setTopQuestions] = useState<Question[]>([]);

    useEffect(() => {
        fetch("http://localhost:8000/analytics/top-questions")
            .then(res => res.json())
            .then(data => setTopQuestions(data.questions));
    }, []);

    return (
        <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Top Customer Questions</h2>

            <ul className="space-y-1">
                {topQuestions.map((q, i) => (
                    <li key={i} className="flex justify-between text-sm">
                        <span className="capitalize">
                            {q.text}
                        </span>
                        <span className="text-gray-500">{q.count}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default page