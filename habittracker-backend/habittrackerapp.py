from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habits.db'
db = SQLAlchemy(app)

# Habit modeli
class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    start_time = db.Column(db.String(10))
    end_time = db.Column(db.String(10))
    date_created = db.Column(db.String(20))

# İlk route'ları ekleyelim
@app.route('/habits', methods=['GET'])
def get_habits():
    habits = Habit.query.all()
    return jsonify([{
        'id': habit.id,
        'text': habit.text,
        'completed': habit.completed,
        'startTime': habit.start_time,
        'endTime': habit.end_time,
        'dateCreated': habit.date_created
    } for habit in habits])

@app.route('/habits', methods=['POST'])
def add_habit():
    data = request.json
    new_habit = Habit(
        text=data['text'],
        completed=data.get('completed', False),
        start_time=data['startTime'],
        end_time=data['endTime'],
        date_created=data['dateCreated']
    )
    db.session.add(new_habit)
    db.session.commit()
    return jsonify({
        'id': new_habit.id,
        'text': new_habit.text
    }), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)