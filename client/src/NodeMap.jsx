import React from 'react';
import { useParams } from 'react-router-dom';

export default function NodeMap() {
  const { hostname } = useParams();

  return <h2>{hostname}</h2>;
}