import React from 'react';

const MemberTable = ({ members, onEdit }) => {
    return (
        <table className="member-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Member Type</th>
                    <th>Group</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {members.map((member) => (
                    <tr key={member.id}>
                        <td>{`${member.first_name} ${member.last_name}`}</td>
                        <td>{member.email}</td>
                        <td>{member.phone}</td>
                        <td>{member.member_type}</td>
                        <td>{member.group_name}</td>
                        <td>
                            <button onClick={() => onEdit(member)}>Edit</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MemberTable;
