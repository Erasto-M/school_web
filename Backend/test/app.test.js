const request = require('supertest');
const app = require('../app'); // assuming app.js is where your Express app is defined

describe('Issue Tracking System Endpoints', () => {
    
    it('should assign technician to an issue', async () => {
        const response = await request(app)
            .put('/assign-technician/1') // assuming issue ID 1 exists
            .send({ technician: 'John Doe' });

        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toContain('Technician \'John Doe\' assigned successfully');
    });

    it('should delete an issue', async () => {
        const response = await request(app)
            .delete('/delete-issue/1'); // assuming issue ID 1 exists

        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toContain('deleted successfully');
    });

    it('should get issues by status', async () => {
        const response = await request(app)
            .get('/issues-by-status/incomplete');

        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toContain('Issues with status \'incomplete\' fetched successfully');
        expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should update an issue details', async () => {
        const response = await request(app)
            .put('/update-issue/1') // assuming issue ID 1 exists
            .send({
                reporter_name: 'New Name',
                email: 'newemail@example.com',
                location: 'New Location',
                issue_description: 'Updated description'
            });

        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toContain('updated successfully');
    });
});
