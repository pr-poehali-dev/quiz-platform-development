import json
import os
import random
import string
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manages quiz game state - creates games, joins players, updates scores
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with game data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Game-Code',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create_game':
                game_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                game_id = f"game_{random.randint(100000, 999999)}"
                
                cur.execute(
                    "INSERT INTO games (id, code) VALUES (%s, %s)",
                    (game_id, game_code)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'game_id': game_id, 'code': game_code})
                }
            
            elif action == 'join_game':
                game_code = body.get('game_code')
                player_name = body.get('player_name')
                
                cur.execute("SELECT id FROM games WHERE code = %s", (game_code,))
                game = cur.fetchone()
                
                if not game:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Game not found'})
                    }
                
                player_id = f"player_{random.randint(100000, 999999)}"
                cur.execute(
                    "INSERT INTO players (id, game_id, name, score) VALUES (%s, %s, %s, 0)",
                    (player_id, game['id'], player_name)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'player_id': player_id,
                        'game_id': game['id'],
                        'name': player_name
                    })
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            player_id = body.get('player_id')
            score_delta = body.get('score_delta', 0)
            
            cur.execute(
                "UPDATE players SET score = score + %s WHERE id = %s RETURNING score",
                (score_delta, player_id)
            )
            result = cur.fetchone()
            conn.commit()
            
            if result:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'new_score': result['score']})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Player not found'})
                }
        
        elif method == 'GET':
            game_code = event.get('queryStringParameters', {}).get('game_code')
            
            if game_code:
                cur.execute("SELECT id FROM games WHERE code = %s", (game_code,))
                game = cur.fetchone()
                
                if not game:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Game not found'})
                    }
                
                cur.execute(
                    "SELECT id, name, score FROM players WHERE game_id = %s ORDER BY score DESC",
                    (game['id'],)
                )
                players = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'game_id': game['id'],
                        'code': game_code,
                        'players': [dict(p) for p in players]
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
